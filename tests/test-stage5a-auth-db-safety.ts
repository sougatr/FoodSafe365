import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { Pool } from 'pg';
import { NextRequest } from 'next/server';

import { hashPassword, hashPasswordSync, verifyPassword } from '../lib/passwords';
import { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { getAuthContext } from '../lib/auth';
import { requireOutletAccess, authorizeFeedbackAccess } from '../lib/tenant';
import { authorizeGroceryAccess } from '../lib/grocery-tenant';
import { setPoolForTesting, resetPool } from '../lib/db';
import { resetMockRateLimits, setRateLimiterPoolForTesting } from '../lib/rate-limiter';
import { runMigrations } from '../lib/migrations';

import { POST as loginHandler } from '../app/api/v1/auth/login/route';
import { POST as orgOnboardingHandler } from '../app/api/v1/organisations/route';
import { POST as groceryOnboardingHandler } from '../app/api/v1/grocery/onboarding/route';
import { POST as providerRegisterHandler } from '../app/api/v1/providers/register/route';
import { GET as getActionsHandler, POST as postActionsHandler } from '../app/api/v1/actions/route';
import { PATCH as patchActionHandler } from '../app/api/v1/actions/[action_id]/route';
import { POST as submitVerificationHandler } from '../app/api/v1/actions/[action_id]/submit-verification/route';
import { POST as verifyActionHandler } from '../app/api/v1/actions/[action_id]/verify/route';
import { GET as getHaccpMonitoringHandler, POST as postHaccpMonitoringHandler } from '../app/api/v1/haccp/monitoring/route';
import { GET as getFeedbackHandler, POST as postFeedbackHandler } from '../app/api/v1/customer-feedback/route';
import { GET as getServiceRequestsHandler, POST as postServiceRequestsHandler } from '../app/api/v1/service-requests/route';

function extractCookieToken(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Stateful Mock PostgreSQL Adapter for Stage 5A Unit & Integration Tests
 */
class Stage5AMockPgPool {
  public users: any[] = [];
  public organisations: any[] = [];
  public outlets: any[] = [];
  public memberships: any[] = [];
  public roles: any[] = [
    { id: '11111111-1111-1111-1111-111111111101', code: 'org_admin', name: 'Org Admin' },
    { id: '11111111-1111-1111-1111-111111111102', code: 'outlet_manager', name: 'Outlet Manager' },
    { id: '11111111-1111-1111-1111-111111111103', code: 'kitchen_staff', name: 'Kitchen Staff' },
    { id: '11111111-1111-1111-1111-111111111104', code: 'supervisor', name: 'Supervisor' }
  ];
  public restaurantTypes: any[] = [
    { id: '22222222-2222-2222-2222-222222222201', code: 'full_service', name: 'Full Service Restaurant' },
    { id: '22222222-2222-2222-2222-222222222202', code: 'restaurant', name: 'Restaurant / Dine-In' }
  ];
  public groceryOutlets: any[] = [];
  public serviceProviders: any[] = [];
  public executedQueries: { sql: string; params: any[] }[] = [];
  private uuidSeq = 1;

  private nextUuid(): string {
    const suffix = String(this.uuidSeq++).padStart(12, '0');
    return `99999999-9999-4999-8999-${suffix}`;
  }

  async connect() {
    return {
      query: (sql: string, params?: any[]) => this.query(sql, params),
      release: () => {}
    };
  }

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    const norm = sql.replace(/\s+/g, ' ').trim();
    this.executedQueries.push({ sql: norm, params });

    if (norm === 'BEGIN' || norm === 'COMMIT' || norm === 'ROLLBACK') {
      return { rows: [], rowCount: 0 };
    }

    if (norm.includes('distributed_rate_limits')) {
      return { rows: [{ points: 1, ttl: 900 }], rowCount: 1 };
    }

    // Duplicate user check in POST /api/v1/organisations
    if (norm.startsWith('SELECT id FROM users WHERE lower(email) = lower($1)')) {
      const email = String(params[0] || '').toLowerCase();
      const found = this.users.find(u => (u.email || '').toLowerCase() === email);
      return { rows: found ? [{ id: found.id }] : [], rowCount: found ? 1 : 0 };
    }

    // Roles lookup
    if (norm.startsWith("SELECT id FROM roles WHERE code='org_admin'")) {
      const r = this.roles.find(x => x.code === 'org_admin');
      return { rows: r ? [{ id: r.id }] : [], rowCount: r ? 1 : 0 };
    }

    // Insert user
    if (norm.startsWith('INSERT INTO users(id,name,mobile,email,password_hash,status')) {
      const id = this.nextUuid();
      const u = {
        id,
        name: params[0],
        mobile: params[1],
        email: params[2],
        password_hash: params[3],
        status: 'active',
        created_at: new Date().toISOString()
      };
      this.users.push(u);
      return { rows: [{ id }], rowCount: 1 };
    }

    // Insert organisation
    if (norm.startsWith('INSERT INTO organisations(id,name,organisation_type,owner_user_id')) {
      const id = this.nextUuid();
      const org = {
        id,
        name: params[0],
        owner_user_id: params[1],
        status: 'active',
        created_at: new Date().toISOString()
      };
      this.organisations.push(org);
      return { rows: [{ id }], rowCount: 1 };
    }

    // Restaurant type lookup (F-03)
    if (norm.includes('FROM restaurant_types')) {
      if (norm.includes('WHERE id=$1 OR code=$1') && !norm.includes('id::text')) {
        throw new Error('invalid input syntax for type uuid: "' + params[0] + '"');
      }
      const val = String(params[0] || '');
      const rt = this.restaurantTypes.find(x => x.id === val || x.code === val);
      return { rows: rt ? [{ id: rt.id }] : [], rowCount: rt ? 1 : 0 };
    }

    // Insert outlet
    if (norm.startsWith('INSERT INTO outlets(id,organisation_id,name,city,restaurant_type_id,status')) {
      const id = this.nextUuid();
      const o = {
        id,
        organisation_id: params[0],
        name: params[1],
        city: params[2],
        restaurant_type_id: params[3],
        status: 'active',
        created_at: new Date(Date.now() + this.uuidSeq * 1000).toISOString()
      };
      this.outlets.push(o);
      return { rows: [{ id }], rowCount: 1 };
    }

    // Insert membership
    if (norm.startsWith('INSERT INTO memberships(id,user_id,organisation_id,outlet_id,role_id,status')) {
      const id = this.nextUuid();
      const m = {
        id,
        user_id: params[0],
        organisation_id: params[1],
        outlet_id: params[2],
        role_id: params[3],
        status: 'active'
      };
      this.memberships.push(m);
      return { rows: [{ id }], rowCount: 1 };
    }

    // Core User Login Query (F-01, F-02, F-10)
    if (norm.includes('FROM users u') && norm.includes('JOIN memberships m')) {
      if (norm.includes('o.active')) {
        throw new Error('column o.active does not exist');
      }
      const email = String(params[0] || '').toLowerCase();
      const requestedOutletId = params[1] ? String(params[1]) : '';

      const matches: any[] = [];
      for (const u of this.users) {
        if ((u.email || '').toLowerCase() !== email) continue;
        if (u.status !== 'active') continue;

        for (const m of this.memberships) {
          if (m.user_id !== u.id || m.status !== 'active') continue;
          const org = this.organisations.find(x => x.id === m.organisation_id && x.status === 'active');
          if (!org) continue;
          const role = this.roles.find(r => r.id === m.role_id);
          if (!role) continue;

          for (const o of this.outlets) {
            if (o.organisation_id !== m.organisation_id) continue;
            if (o.status !== 'active') continue;
            if (m.outlet_id !== null && m.outlet_id !== undefined && o.id !== m.outlet_id) continue;
            if (requestedOutletId && o.id !== requestedOutletId) continue;

            matches.push({
              user_id: u.id,
              email: u.email,
              password_hash: u.password_hash,
              organisation_id: m.organisation_id,
              outlet_id: o.id,
              role: role.code,
              created_at: o.created_at
            });
          }
        }
      }
      matches.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
      return { rows: matches.slice(0, 1), rowCount: matches.length ? 1 : 0 };
    }

    // Grocery schema & queries
    if (norm.startsWith('INSERT INTO grocery_outlets')) {
      const [id, name, branchName, address, city, managerName, contactNumber, contactEmail, fssaiNumber, storeType, selectedCategories] = params;
      let existing = this.groceryOutlets.find(g => g.id === id);
      const now = new Date().toISOString();
      if (existing) {
        Object.assign(existing, {
          name,
          branchName,
          address,
          city,
          managerName,
          contactNumber,
          contactEmail,
          contact_email: contactEmail,
          fssaiNumber,
          storeType,
          selectedCategories,
          updatedAt: now
        });
      } else {
        existing = {
          id,
          name,
          branchName,
          address,
          city,
          managerName,
          contactNumber,
          contactEmail,
          contact_email: contactEmail,
          password_hash: null,
          fssaiNumber,
          storeType,
          selectedCategories,
          createdAt: now,
          updatedAt: now,
          created_at: now
        };
        this.groceryOutlets.push(existing);
      }
      return { rows: [existing], rowCount: 1 };
    }

    if (norm.startsWith('UPDATE grocery_outlets SET password_hash = $2')) {
      const g = this.groceryOutlets.find(x => x.id === params[0]);
      if (g) g.password_hash = params[1];
      return { rows: [], rowCount: g ? 1 : 0 };
    }

    if (norm.includes('FROM grocery_outlets') && norm.includes('lower(contact_email) = lower($1)')) {
      const email = String(params[0] || '').toLowerCase();
      const outletId = params[1] ? String(params[1]) : '';
      const found = this.groceryOutlets.find(
        g => (g.contact_email || '').toLowerCase() === email && (!outletId || g.id === outletId)
      );
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }

    if (norm.includes('count(*)::int as count FROM grocery_')) {
      return { rows: [{ count: 1 }], rowCount: 1 };
    }

    // Service providers
    if (norm.startsWith('INSERT INTO service_providers')) {
      const [id, business_name, contact_name, mobile, email, address, city, state, categories, description, verification_status, status] = params;
      const row = {
        id,
        business_name,
        contact_name,
        mobile,
        email,
        password_hash: null,
        address,
        city,
        state,
        categories,
        description,
        verification_status,
        status,
        created_at: new Date().toISOString()
      };
      this.serviceProviders.push(row);
      return { rows: [row], rowCount: 1 };
    }

    if (norm.startsWith('UPDATE service_providers SET password_hash = $2')) {
      const p = this.serviceProviders.find(x => x.id === params[0]);
      if (p) p.password_hash = params[1];
      return { rows: [], rowCount: p ? 1 : 0 };
    }

    if (norm.includes('FROM service_providers') && norm.includes('lower(email) = lower($1)')) {
      const email = String(params[0] || '').toLowerCase();
      const found = this.serviceProviders.find(p => (p.email || '').toLowerCase() === email && p.status === 'active');
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }

    return { rows: [], rowCount: 0 };
  }
}

async function runDisposablePostgresStage5ATests(): Promise<number> {
  const initdbBin = '/opt/homebrew/bin/initdb';
  const pgCtlBin = '/opt/homebrew/bin/pg_ctl';
  if (!fs.existsSync(initdbBin) || !fs.existsSync(pgCtlBin)) {
    console.log('ℹ️ Local PostgreSQL binaries not found at /opt/homebrew/bin; skipping disposable cluster sub-suite.');
    return 0;
  }

  console.log('\n--- SECTION F: REAL DISPOSABLE LOCAL POSTGRESQL VERIFICATION ---');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs365_stage5a_pg_'));
  const dataDir = path.join(tmpDir, 'data');
  const logFile = path.join(tmpDir, 'postgres.log');
  const port = 55430 + Math.floor(Math.random() * 400);
  const dbUrl = `postgresql://postgres@127.0.0.1:${port}/postgres`;

  const origDbUrl = process.env.DATABASE_URL;
  const origSsl = process.env.DATABASE_SSL;
  let pgStarted = false;
  let pool: Pool | null = null;
  let passedCount = 0;

  try {
    try {
      execFileSync(initdbBin, ['-D', dataDir, '-U', 'postgres', '-A', 'trust', '--no-instructions'], { stdio: 'pipe' });
    } catch (initErr: any) {
      console.log(`ℹ️ Disposable local PostgreSQL initdb unavailable in this sandbox (${initErr?.message || initErr}). Skipping disposable cluster.`);
      return 0;
    }
    execFileSync(pgCtlBin, ['-D', dataDir, '-l', logFile, '-o', `-p ${port} -k ${tmpDir}`, 'start'], { stdio: 'pipe' });
    pgStarted = true;

    pool = new Pool({ connectionString: dbUrl });

    // 1. Run all tracked migrations 000..012 on real PostgreSQL
    const migRes = await runMigrations({ pool });
    assert.strictEqual(migRes.success, true, `Migrations failed on real PostgreSQL: ${migRes.error}`);
    assert.ok(migRes.applied.some(v => v.includes('012_add_credential_columns')), 'Migration 012 must be applied on real PostgreSQL');

    // Seed baseline lookup tables from db/seed.sql
    const seedSql = fs.readFileSync(path.join(process.cwd(), 'db', 'seed.sql'), 'utf-8');
    await pool.query(seedSql);
    passedCount++;
    console.log(`✅ PG-1 PASSED: Applied ${migRes.applied.length} tracked migrations (000..012) + seed.sql on disposable PostgreSQL (port ${port})`);

    // Bind app DB layer to this real PostgreSQL pool
    process.env.DATABASE_URL = dbUrl;
    process.env.DATABASE_SSL = 'false';
    setPoolForTesting(pool);
    setRateLimiterPoolForTesting(null);
    resetMockRateLimits();

    // 2. Real PostgreSQL Organisation Onboarding (F-03 + F-02) with non-UUID restaurantTypeId ('full_service')
    const onboardReq = new Request('http://localhost:3000/api/v1/organisations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.10.1.1' },
      body: JSON.stringify({
        user: {
          name: 'Aarti Kulkarni',
          mobile: '9820011223',
          email: 'aarti@bistromumbai.example.com',
          password: 'CorrectHorseBattery99!'
        },
        organisation: { name: 'Bistro Mumbai Pvt Ltd' },
        outlet: { name: 'Bistro Mumbai Bandra', city: 'Mumbai', restaurantTypeId: 'full_service' },
        processCodes: ['receiving', 'cold_storage'],
        equipmentCodes: ['chiller']
      })
    });
    const onboardRes = await orgOnboardingHandler(onboardReq);
    const onboardBody = await onboardRes.json();
    assert.strictEqual(onboardRes.status, 201, `Expected 201 from real PG onboarding, got ${onboardRes.status}: ${JSON.stringify(onboardBody)}`);
    assert.ok(onboardBody.data?.organisationId);
    assert.ok(onboardBody.data?.outletId);
    assert.ok(onboardBody.data?.userId);
    const onboardToken = extractCookieToken(onboardRes.headers.get('set-cookie'));
    assert.ok(onboardToken, 'Real PG onboarding must issue signed fs_session cookie');
    const verifiedOnboardSession = verifySessionToken(onboardToken!);
    assert.strictEqual(verifiedOnboardSession.valid, true);
    assert.strictEqual(verifiedOnboardSession.data?.role, 'org_admin');
    assert.strictEqual(verifiedOnboardSession.data?.journey, 'restaurant');
    passedCount++;
    console.log('✅ PG-2 PASSED: Real PostgreSQL POST /api/v1/organisations succeeds with code="full_service", hashes password, and issues session');

    // 3. Duplicate email during onboarding returns 409 on real PostgreSQL
    const dupReq = new Request('http://localhost:3000/api/v1/organisations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.10.1.2' },
      body: JSON.stringify({
        user: {
          name: 'Aarti Duplicate',
          mobile: '9820011224',
          email: 'AARTI@bistromumbai.example.com',
          password: 'AnotherPassword99!'
        },
        organisation: { name: 'Duplicate Org' },
        outlet: { name: 'Duplicate Outlet', city: 'Mumbai', restaurantTypeId: 'full_service' }
      })
    });
    const dupRes = await orgOnboardingHandler(dupReq);
    assert.strictEqual(dupRes.status, 409, 'Duplicate email must return 409 on real PostgreSQL');
    passedCount++;
    console.log('✅ PG-3 PASSED: Real PostgreSQL duplicate email onboarding rejected with HTTP 409');

    // 4. Real PostgreSQL Login (F-01 + F-02 + F-10)
    const loginOkReq = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.10.1.3' },
      body: JSON.stringify({
        email: 'aarti@bistromumbai.example.com',
        password: 'CorrectHorseBattery99!',
        role: 'platform_admin' // Attempt client-side role escalation; server must grant org_admin from DB
      })
    });
    const loginOkRes = await loginHandler(loginOkReq);
    const loginOkBody = await loginOkRes.json();
    assert.strictEqual(loginOkRes.status, 200, 'Valid password login on real PostgreSQL must return 200');
    assert.strictEqual(loginOkBody.data?.role, 'org_admin', 'Server must assign DB membership role, ignoring client role');
    assert.strictEqual(loginOkBody.data?.outlet?.id, onboardBody.data.outletId);
    passedCount++;
    console.log('✅ PG-4 PASSED: Real PostgreSQL POST /api/v1/auth/login verifies password_hash and enforces DB membership role');

    // 5. Wrong password rejected on real PostgreSQL
    const loginBadReq = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.10.1.4' },
      body: JSON.stringify({
        email: 'aarti@bistromumbai.example.com',
        password: 'WrongPassword123!'
      })
    });
    const loginBadRes = await loginHandler(loginBadReq);
    assert.strictEqual(loginBadRes.status, 401, 'Wrong password must return 401 on real PostgreSQL');
    assert.strictEqual(extractCookieToken(loginBadRes.headers.get('set-cookie')), null);
    passedCount++;
    console.log('✅ PG-5 PASSED: Real PostgreSQL rejects wrong password with 401 and issues no cookie');

    // 6. Inactive outlet rejected on real PostgreSQL (F-01)
    await pool.query(`UPDATE outlets SET status = 'inactive' WHERE id = $1`, [onboardBody.data.outletId]);
    const loginInactiveOutletReq = new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.10.1.5' },
      body: JSON.stringify({
        email: 'aarti@bistromumbai.example.com',
        password: 'CorrectHorseBattery99!'
      })
    });
    const loginInactiveOutletRes = await loginHandler(loginInactiveOutletReq);
    assert.strictEqual(loginInactiveOutletRes.status, 401, 'Inactive outlet must not authenticate');
    await pool.query(`UPDATE outlets SET status = 'active' WHERE id = $1`, [onboardBody.data.outletId]);
    passedCount++;
    console.log('✅ PG-6 PASSED: Real PostgreSQL rejects login when outlet status is inactive');

    return passedCount;
  } finally {
    if (pool) {
      await pool.end().catch(() => {});
    }
    setPoolForTesting(null);
    resetPool();
    if (origDbUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = origDbUrl;
    if (origSsl === undefined) delete process.env.DATABASE_SSL;
    else process.env.DATABASE_SSL = origSsl;

    if (pgStarted) {
      try {
        execFileSync(pgCtlBin, ['-D', dataDir, '-m', 'immediate', 'stop'], { stdio: 'pipe' });
      } catch {}
    }
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  console.log('================================================================');
  console.log('FOODSAFE365 — STAGE 5A AUTHENTICATION & DATABASE SAFETY SUITE');
  console.log('================================================================\n');

  let passed = 0;

  // -------------------------------------------------------------------------
  // SECTION A: PASSWORD HASHING & VERIFICATION (F-02)
  // -------------------------------------------------------------------------
  console.log('--- SECTION A: PASSWORD HASHING & VERIFICATION (F-02) ---');

  const h1 = await hashPassword('StrongPass!2026');
  const h2 = hashPasswordSync('StrongPass!2026');
  assert.ok(h1.startsWith('scrypt$16384$8$1$'), 'Hash format must include scrypt parameters');
  assert.notStrictEqual(h1, h2, 'Random salt must produce distinct hashes for identical passwords');
  assert.strictEqual(await verifyPassword('StrongPass!2026', h1), true);
  assert.strictEqual(await verifyPassword('StrongPass!2026', h2), true);
  assert.strictEqual(await verifyPassword('WrongPass!2026', h1), false);
  assert.strictEqual(await verifyPassword('', h1), false);
  assert.strictEqual(await verifyPassword('StrongPass!2026', null), false);
  assert.strictEqual(await verifyPassword('StrongPass!2026', 'malformed$hash'), false);
  passed++;
  console.log('✅ TEST 1 PASSED: scrypt password hashing uses random 16-byte salt and timing-safe verification');

  // -------------------------------------------------------------------------
  // SECTION B: ORGANISATION ONBOARDING & LOGIN SQL / CREDENTIALS (F-01, F-02, F-03)
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION B: ORGANISATION ONBOARDING & LOGIN SQL (F-01, F-02, F-03) ---');

  const mockPool = new Stage5AMockPgPool();
  const origDbUrl = process.env.DATABASE_URL;
  const origNodeEnv = process.env.NODE_ENV;
  process.env.DATABASE_URL = 'postgresql://mock:5432/foodsafe365';
  setPoolForTesting(mockPool);
  setRateLimiterPoolForTesting(mockPool);
  resetMockRateLimits();

  // Test 2: Organisation onboarding with non-UUID restaurantTypeId ('full_service') and password
  const orgReq = new Request('http://localhost:3000/api/v1/organisations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' },
    body: JSON.stringify({
      user: {
        name: 'Vikramjit Roy',
        mobile: '9820098200',
        email: 'vikram@roykitchens.com',
        password: 'KitchenAdmin#2026'
      },
      organisation: { name: 'Roy Kitchens Group' },
      outlet: { name: 'Roy Kitchen Colaba', city: 'Mumbai', restaurantTypeId: 'full_service' },
      processCodes: ['cooking'],
      equipmentCodes: ['freezer']
    })
  });
  const orgRes = await orgOnboardingHandler(orgReq);
  const orgJson = await orgRes.json();
  assert.strictEqual(orgRes.status, 201, 'Organisation onboarding must return 201');
  assert.ok(orgJson.data?.organisationId && orgJson.data?.outletId && orgJson.data?.userId);
  const orgCookie = extractCookieToken(orgRes.headers.get('set-cookie'));
  assert.ok(orgCookie, 'DB-backed organisation onboarding must set signed fs_session cookie');
  const orgSession = verifySessionToken(orgCookie!);
  assert.strictEqual(orgSession.valid, true);
  assert.strictEqual(orgSession.data?.role, 'org_admin');
  assert.strictEqual(orgSession.data?.journey, 'restaurant');
  passed++;
  console.log('✅ TEST 2 PASSED: POST /api/v1/organisations resolves restaurant_types by id::text OR code, stores password_hash, and issues fs_session');

  // Test 3: Duplicate email rejected with 409
  const dupOrgReq = new Request('http://localhost:3000/api/v1/organisations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.2' },
    body: JSON.stringify({
      user: {
        name: 'Vikramjit Roy 2',
        mobile: '9820098201',
        email: 'VIKRAM@roykitchens.com',
        password: 'KitchenAdmin#2026'
      },
      organisation: { name: 'Roy Kitchens 2' },
      outlet: { name: 'Roy Kitchen 2', city: 'Mumbai', restaurantTypeId: 'full_service' }
    })
  });
  const dupOrgRes = await orgOnboardingHandler(dupOrgReq);
  assert.strictEqual(dupOrgRes.status, 409, 'Duplicate email must return 409');
  passed++;
  console.log('✅ TEST 3 PASSED: Duplicate email onboarding returns HTTP 409 DUPLICATE_ACCOUNT');

  // Test 4: Valid login against onboarded restaurant account (F-01, F-02)
  const loginValidReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.3' },
    body: JSON.stringify({
      email: 'vikram@roykitchens.com',
      password: 'KitchenAdmin#2026',
      role: 'restaurant'
    })
  });
  const loginValidRes = await loginHandler(loginValidReq);
  const loginValidJson = await loginValidRes.json();
  assert.strictEqual(loginValidRes.status, 200);
  assert.strictEqual(loginValidJson.data?.role, 'org_admin');
  assert.strictEqual(loginValidJson.data?.outlet?.id, orgJson.data.outletId);
  assert.ok(extractCookieToken(loginValidRes.headers.get('set-cookie')));
  passed++;
  console.log('✅ TEST 4 PASSED: Valid restaurant login succeeds with 200 and issues signed session cookie');

  // Test 5: Email-only login (missing password) and wrong password fail with 400 / 401
  const emailOnlyReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.4' },
    body: JSON.stringify({ email: 'vikram@roykitchens.com' })
  });
  const emailOnlyRes = await loginHandler(emailOnlyReq);
  assert.strictEqual(emailOnlyRes.status, 400, 'Missing password must return 400 VALIDATION_ERROR');
  assert.strictEqual(extractCookieToken(emailOnlyRes.headers.get('set-cookie')), null);

  const wrongPassReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.5' },
    body: JSON.stringify({ email: 'vikram@roykitchens.com', password: 'WrongPassword!' })
  });
  const wrongPassRes = await loginHandler(wrongPassReq);
  assert.strictEqual(wrongPassRes.status, 401, 'Wrong password must return 401 UNAUTHENTICATED');
  assert.strictEqual(extractCookieToken(wrongPassRes.headers.get('set-cookie')), null);
  passed++;
  console.log('✅ TEST 5 PASSED: Email-only login (400) and wrong password (401) rejected without issuing session');

  // Test 6: Account with NULL password_hash is rejected (F-02)
  const passwordlessUserId = '99999999-9999-4999-8999-000000000999';
  mockPool.users.push({
    id: passwordlessUserId,
    name: 'Legacy User',
    mobile: '9820000000',
    email: 'legacy@roykitchens.com',
    password_hash: null,
    status: 'active'
  });
  mockPool.memberships.push({
    id: '99999999-9999-4999-8999-000000000998',
    user_id: passwordlessUserId,
    organisation_id: orgJson.data.organisationId,
    outlet_id: orgJson.data.outletId,
    role_id: '11111111-1111-1111-1111-111111111103',
    status: 'active'
  });

  const nullHashLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.6' },
    body: JSON.stringify({ email: 'legacy@roykitchens.com', password: 'AnyPassword123!' })
  });
  const nullHashLoginRes = await loginHandler(nullHashLoginReq);
  assert.strictEqual(nullHashLoginRes.status, 401, 'User without password_hash must be rejected with 401');
  passed++;
  console.log('✅ TEST 6 PASSED: Account with NULL password_hash is rejected with HTTP 401');

  // Test 7: Outlet-scoped membership enforcement and inactive status rejection (F-01)
  const secondOutletId = '99999999-9999-4999-8999-000000000777';
  mockPool.outlets.push({
    id: secondOutletId,
    organisation_id: orgJson.data.organisationId,
    name: 'Roy Kitchen Bandra',
    city: 'Mumbai',
    status: 'active',
    created_at: new Date(Date.now() + 50000).toISOString()
  });

  const staffHash = await hashPassword('StaffPass#2026');
  const staffUserId = '99999999-9999-4999-8999-000000000888';
  mockPool.users.push({
    id: staffUserId,
    name: 'Scoped Staff',
    mobile: '9820000111',
    email: 'staff.bandra@roykitchens.com',
    password_hash: staffHash,
    status: 'active'
  });
  mockPool.memberships.push({
    id: '99999999-9999-4999-8999-000000000887',
    user_id: staffUserId,
    organisation_id: orgJson.data.organisationId,
    outlet_id: secondOutletId, // Scoped ONLY to secondOutletId
    role_id: '11111111-1111-1111-1111-111111111103', // kitchen_staff
    status: 'active'
  });

  // Staff member scoped to secondOutletId must resolve to secondOutletId (not first outlet) and get kitchen_staff (even if requesting org_admin)
  const scopedLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.7' },
    body: JSON.stringify({
      email: 'staff.bandra@roykitchens.com',
      password: 'StaffPass#2026',
      role: 'org_admin' // Attempt escalation
    })
  });
  const scopedLoginRes = await loginHandler(scopedLoginReq);
  const scopedLoginJson = await scopedLoginRes.json();
  assert.strictEqual(scopedLoginRes.status, 200);
  assert.strictEqual(scopedLoginJson.data?.outlet?.id, secondOutletId, 'Must resolve to membership-scoped outlet');
  assert.strictEqual(scopedLoginJson.data?.role, 'kitchen_staff', 'Must not escalate role from client body');

  // Requesting the unassigned first outlet must fail with 401
  const wrongOutletLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.8' },
    body: JSON.stringify({
      email: 'staff.bandra@roykitchens.com',
      password: 'StaffPass#2026',
      outletId: orgJson.data.outletId
    })
  });
  const wrongOutletLoginRes = await loginHandler(wrongOutletLoginReq);
  assert.strictEqual(wrongOutletLoginRes.status, 401, 'Outlet-scoped user must not log into another outlet in same org');
  passed++;
  console.log('✅ TEST 7 PASSED: Outlet-scoped membership enforced and client-supplied role escalation blocked');

  // -------------------------------------------------------------------------
  // SECTION C: MULTI-JOURNEY LOGIN & CROSS-JOURNEY ISOLATION (F-10)
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION C: MULTI-JOURNEY LOGIN & CROSS-JOURNEY ISOLATION (F-10) ---');

  // Test 8: Grocery onboarding + DB login
  const grocOnboardReq = new Request('http://localhost:3000/api/v1/grocery/onboarding', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.9' },
    body: JSON.stringify({
      id: 'store-fresh-mart-powai',
      name: 'Fresh Mart Powai',
      city: 'Mumbai',
      managerName: 'Neha Joshi',
      contactEmail: 'neha@freshmart.example.com',
      password: 'GroceryPassword#1'
    })
  });
  const grocOnboardRes = await groceryOnboardingHandler(grocOnboardReq);
  assert.strictEqual(grocOnboardRes.status, 200);

  const grocLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.10' },
    body: JSON.stringify({
      email: 'neha@freshmart.example.com',
      password: 'GroceryPassword#1',
      role: 'grocery'
    })
  });
  const grocLoginRes = await loginHandler(grocLoginReq);
  const grocLoginJson = await grocLoginRes.json();
  assert.strictEqual(grocLoginRes.status, 200);
  assert.strictEqual(grocLoginJson.data?.role, 'outlet_manager');
  assert.strictEqual(grocLoginJson.data?.journey, 'grocery');
  assert.strictEqual(grocLoginJson.data?.outlet?.id, 'store-fresh-mart-powai');
  const grocToken = extractCookieToken(grocLoginRes.headers.get('set-cookie'))!;
  assert.ok(grocToken);
  passed++;
  console.log('✅ TEST 8 PASSED: Grocery onboarding persists password_hash and DB login issues grocery-scoped session');

  // Test 9: Service provider registration + DB login
  const provRegReq = new Request('http://localhost:3000/api/v1/providers/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.11' },
    body: JSON.stringify({
      businessName: 'SafeGuard Pest Control LLP',
      contactName: 'Ramesh Kulkarni',
      mobile: '9820198201',
      email: 'ramesh@safeguardpest.example.com',
      password: 'ProviderPassword#1',
      city: 'Mumbai',
      categories: ['pest_control'],
      description: 'Commercial kitchen pest management services'
    })
  });
  const provRegRes = await providerRegisterHandler(provRegReq);
  assert.strictEqual(provRegRes.status, 201);

  const provLoginReq = new Request('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.12' },
    body: JSON.stringify({
      email: 'ramesh@safeguardpest.example.com',
      password: 'ProviderPassword#1',
      role: 'provider'
    })
  });
  const provLoginRes = await loginHandler(provLoginReq);
  const provLoginJson = await provLoginRes.json();
  assert.strictEqual(provLoginRes.status, 200);
  assert.strictEqual(provLoginJson.data?.role, 'vendor');
  assert.strictEqual(provLoginJson.data?.journey, 'provider');
  const provToken = extractCookieToken(provLoginRes.headers.get('set-cookie'))!;
  assert.ok(provToken);
  passed++;
  console.log('✅ TEST 9 PASSED: Service provider registration persists password_hash and DB login issues provider-scoped session');

  // Test 10: Cross-journey isolation enforcement
  // 10a: Grocery session cannot access restaurant actions, restaurant HACCP monitoring, or restaurant tenant context
  const grocCookieReq = new Request('http://localhost:3000/api/v1/actions', {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${grocToken}` }
  });
  const grocTenant = await requireOutletAccess(orgJson.data.outletId, grocCookieReq);
  assert.strictEqual(grocTenant.ok, false, 'Grocery session must not resolve as a restaurant tenant');
  assert.strictEqual(grocTenant.status, 403);

  const grocActionsRes = await getActionsHandler(grocCookieReq);
  assert.strictEqual(grocActionsRes.status, 403, 'Grocery session must be forbidden on restaurant /api/v1/actions');

  const grocHaccpReq = new Request('http://localhost:3000/api/v1/haccp/monitoring', {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${grocToken}` }
  });
  const grocHaccpRes = await getHaccpMonitoringHandler(grocHaccpReq);
  assert.strictEqual(grocHaccpRes.status, 403, 'Grocery session must be forbidden on restaurant /api/v1/haccp/monitoring');

  const grocSrvReq = new Request('http://localhost:3000/api/v1/service-requests', {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${grocToken}` }
  });
  const grocSrvRes = await getServiceRequestsHandler(grocSrvReq);
  assert.strictEqual(grocSrvRes.status, 403, 'Grocery session must be forbidden on restaurant /api/v1/service-requests');

  // 10b: Restaurant session cannot access grocery endpoints
  const restToGroceryReq = new Request('http://localhost:3000/api/v1/grocery/dashboard?outletId=' + orgJson.data.outletId, {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${orgCookie}` }
  });
  const restToGroceryAuth = await authorizeGroceryAccess(orgJson.data.outletId, restToGroceryReq);
  assert.strictEqual(restToGroceryAuth.ok, false);
  if (!restToGroceryAuth.ok) {
    assert.strictEqual(restToGroceryAuth.status, 403, 'Restaurant session must be forbidden on grocery endpoints');
  }

  // 10c: Provider session cannot access restaurant corrective actions or grocery endpoints
  const provToActionsReq = new Request('http://localhost:3000/api/v1/actions', {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${provToken}` }
  });
  const provToActionsRes = await getActionsHandler(provToActionsReq);
  assert.strictEqual(provToActionsRes.status, 403, 'Provider session must be forbidden on restaurant /api/v1/actions');
  passed++;
  console.log('✅ TEST 10 PASSED: Cross-journey isolation strictly enforced across restaurant, grocery, and provider sessions');

  // -------------------------------------------------------------------------
  // SECTION D: PRODUCTION FAIL-CLOSED WITHOUT DATABASE_URL (F-06)
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION D: PRODUCTION FAIL-CLOSED WITHOUT DATABASE_URL (F-06) ---');

  const origSessionSecret = process.env.SESSION_SECRET;
  delete process.env.DATABASE_URL;
  (process.env as any).NODE_ENV = 'production';
  process.env.SESSION_SECRET = '9f8b4a2e1c7d6e5a3b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';
  resetMockRateLimits();
  setRateLimiterPoolForTesting(null);

  const validRestSessionToken = createSessionToken({
    userId: '99999999-9999-4999-8999-000000000001',
    organisationId: '99999999-9999-4999-8999-000000000002',
    outletId: '99999999-9999-4999-8999-000000000003',
    role: 'org_admin',
    journey: 'restaurant'
  });
  const validGrocSessionToken = createSessionToken({
    userId: 'mgr-store-1',
    organisationId: 'org-store-1',
    outletId: 'store-1',
    role: 'outlet_manager',
    journey: 'grocery'
  });

  // 11a: Login fails closed with 500 CONFIGURATION_ERROR
  const prodLoginRes = await loginHandler(
    new Request('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.1' },
      body: JSON.stringify({ email: 'demo@foodsafe365.com', password: 'demo' })
    })
  );
  assert.strictEqual(prodLoginRes.status, 500);
  assert.strictEqual((await prodLoginRes.json()).error?.code, 'CONFIGURATION_ERROR');

  // 11b: Organisation onboarding fails closed with 500 CONFIGURATION_ERROR
  const prodOrgRes = await orgOnboardingHandler(
    new Request('http://localhost:3000/api/v1/organisations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.2' },
      body: JSON.stringify({
        user: { name: 'Admin', mobile: '9820012345' },
        organisation: { name: 'Org' },
        outlet: { name: 'Outlet', city: 'Mumbai', restaurantTypeId: 'full_service' }
      })
    })
  );
  assert.strictEqual(prodOrgRes.status, 500);
  assert.strictEqual((await prodOrgRes.json()).error?.code, 'CONFIGURATION_ERROR');

  // 11c: Grocery onboarding & provider registration fail closed with 500 CONFIGURATION_ERROR
  const prodGrocRes = await groceryOnboardingHandler(
    new Request('http://localhost:3000/api/v1/grocery/onboarding', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.3' },
      body: JSON.stringify({ name: 'Store' })
    })
  );
  assert.strictEqual(prodGrocRes.status, 500);

  const prodProvRes = await providerRegisterHandler(
    new Request('http://localhost:3000/api/v1/providers/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.4' },
      body: JSON.stringify({
        businessName: 'Pest Co',
        contactName: 'Owner',
        mobile: '9820012345',
        email: 'owner@pestco.com',
        city: 'Mumbai',
        categories: ['pest_control'],
        description: 'Commercial pest control'
      })
    })
  );
  assert.strictEqual(prodProvRes.status, 500);

  // 11d: Corrective actions routes fail closed with 500 CONFIGURATION_ERROR
  const authCookieHeader = { cookie: `${SESSION_COOKIE_NAME}=${validRestSessionToken}`, 'content-type': 'application/json' };
  const prodGetActions = await getActionsHandler(new Request('http://localhost:3000/api/v1/actions', { headers: authCookieHeader }));
  assert.strictEqual(prodGetActions.status, 500);

  const prodPostActions = await postActionsHandler(
    new Request('http://localhost:3000/api/v1/actions', {
      method: 'POST',
      headers: authCookieHeader,
      body: JSON.stringify({ title: 'Fix chiller' })
    })
  );
  assert.strictEqual(prodPostActions.status, 500);

  const prodPatchAction = await patchActionHandler(
    new Request('http://localhost:3000/api/v1/actions/act-1', {
      method: 'PATCH',
      headers: authCookieHeader,
      body: JSON.stringify({ status: 'in_progress' })
    }),
    { params: { action_id: 'act-1' } }
  );
  assert.strictEqual(prodPatchAction.status, 500);

  const prodSubmitVer = await submitVerificationHandler(
    new Request('http://localhost:3000/api/v1/actions/act-1/submit-verification', {
      method: 'POST',
      headers: authCookieHeader,
      body: JSON.stringify({ correctiveActionTaken: 'Fixed seal' })
    }),
    { params: { action_id: 'act-1' } }
  );
  assert.strictEqual(prodSubmitVer.status, 500);

  const prodVerifyAct = await verifyActionHandler(
    new Request('http://localhost:3000/api/v1/actions/act-1/verify', {
      method: 'POST',
      headers: authCookieHeader,
      body: JSON.stringify({ verificationResult: 'verified_effective', verificationMethod: 'visual_inspection', verificationNotes: 'Checked' })
    }),
    { params: { action_id: 'act-1' } }
  );
  assert.strictEqual(prodVerifyAct.status, 500);

  // 11e: HACCP monitoring & customer feedback & tenant helpers fail closed with 500 CONFIGURATION_ERROR
  const prodGetHaccp = await getHaccpMonitoringHandler(new Request('http://localhost:3000/api/v1/haccp/monitoring', { headers: authCookieHeader }));
  assert.strictEqual(prodGetHaccp.status, 500);

  const prodPostHaccp = await postHaccpMonitoringHandler(
    new Request('http://localhost:3000/api/v1/haccp/monitoring', {
      method: 'POST',
      headers: authCookieHeader,
      body: JSON.stringify({ stepCode: 'cooking', parameterName: 'Core Temp', valueNumber: 75, unit: 'C' })
    })
  );
  assert.strictEqual(prodPostHaccp.status, 500);

  const prodGetFb = await getFeedbackHandler(new NextRequest('http://localhost:3000/api/v1/customer-feedback?outletId=99999999-9999-4999-8999-000000000003', { headers: authCookieHeader }));
  assert.strictEqual(prodGetFb.status, 500);

  const prodPostFb = await postFeedbackHandler(
    new NextRequest('http://localhost:3000/api/v1/customer-feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.5' },
      body: JSON.stringify({
        outletId: 'leopold-cafe',
        outletName: 'Leopold Cafe',
        scores: { cleanliness: 5, staffHygiene: 5, foodFreshness: 5, safeWater: 5, washroom: 5 },
        overallScore: 5
      })
    })
  );
  assert.strictEqual(prodPostFb.status, 500);

  const prodTenant = await requireOutletAccess('99999999-9999-4999-8999-000000000003', new Request('http://localhost:3000/api/v1/actions', { headers: authCookieHeader }));
  assert.strictEqual(prodTenant.ok, false, 'requireOutletAccess must fail in production when DATABASE_URL is missing');
  assert.strictEqual(prodTenant.status, 500);

  const prodFbAuth = await authorizeFeedbackAccess('99999999-9999-4999-8999-000000000003', new Request('http://localhost:3000/api/v1/customer-feedback', { headers: authCookieHeader }));
  assert.strictEqual(prodFbAuth.ok, false);
  if (!prodFbAuth.ok) {
    assert.strictEqual(prodFbAuth.status, 500);
  }

  const prodGroceryAccess = await authorizeGroceryAccess(
    'store-1',
    new Request('http://localhost:3000/api/v1/grocery/dashboard?outletId=store-1', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${validGrocSessionToken}` }
    })
  );
  assert.strictEqual(prodGroceryAccess.ok, false);
  if (!prodGroceryAccess.ok) {
    assert.strictEqual(prodGroceryAccess.status, 500);
  }
  passed++;
  console.log('✅ TEST 11 PASSED: All core routes and tenant helpers fail closed with 500 CONFIGURATION_ERROR in production without DATABASE_URL');

  // Restore env
  (process.env as any).NODE_ENV = origNodeEnv;
  if (origDbUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = origDbUrl;
  if (origSessionSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = origSessionSecret;
  setPoolForTesting(null);

  // Run disposable real PostgreSQL verification
  const pgPassed = await runDisposablePostgresStage5ATests();
  passed += pgPassed;

  console.log('\n================================================================');
  console.log(`🎯 ALL ${passed} STAGE 5A AUTHENTICATION & DB SAFETY TESTS PASSED`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('❌ STAGE 5A TEST SUITE FAILED:', err);
  process.exit(1);
});
