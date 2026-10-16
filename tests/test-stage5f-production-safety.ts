import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

import { createSessionToken, SESSION_COOKIE_NAME } from '../lib/session';
import { resetPool } from '../lib/db';

// Handlers for in-scope routes
import { GET as getRestaurantTypesHandler } from '../app/api/v1/restaurant-types/route';
import { GET as getFoodProcessesHandler } from '../app/api/v1/food-processes/route';
import { GET as getEquipmentTypesHandler } from '../app/api/v1/equipment-types/route';

import { GET as getTodayChecksHandler } from '../app/api/v1/outlets/[outlet_id]/checks/today/route';
import { GET as getCheckPlanHandler } from '../app/api/v1/outlets/[outlet_id]/check-plan/route';
import { GET as getApplicableRulesHandler } from '../app/api/v1/outlets/[outlet_id]/applicable-rules/route';
import { GET as getOutletHandler } from '../app/api/v1/outlets/[outlet_id]/route';
import { GET as getCheckHandler } from '../app/api/v1/checks/[check_id]/route';
import { POST as startCheckHandler } from '../app/api/v1/checks/[check_id]/start/route';
import { POST as checkResponsesHandler } from '../app/api/v1/checks/[check_id]/responses/route';
import { GET as getDashboardTodayHandler } from '../app/api/v1/dashboard/today/route';
import { POST as postEvidenceHandler } from '../app/api/v1/evidence/route';

import { GET as getGroceryDailyCheckHandler, POST as postGroceryDailyCheckHandler } from '../app/api/v1/grocery/daily-check/route';
import { GET as getGroceryStorageHandler, POST as postGroceryStorageHandler } from '../app/api/v1/grocery/storage/route';
import { GET as getGroceryAlertsHandler } from '../app/api/v1/grocery/alerts/route';
import { GET as getGroceryDashboardHandler } from '../app/api/v1/grocery/dashboard/route';
import { GET as getGroceryReceivingHandler, POST as postGroceryReceivingHandler } from '../app/api/v1/grocery/receiving/route';
import { GET as getGroceryStockHandler, POST as postGroceryStockHandler } from '../app/api/v1/grocery/stock/route';
import { GET as getGroceryTemperatureHandler, POST as postGroceryTemperatureHandler } from '../app/api/v1/grocery/temperature/route';

import { GET as getRecordsHandler } from '../app/api/v1/records/route';
import { GET as getHaccpHandler, POST as postHaccpHandler } from '../app/api/v1/haccp/route';
import { GET as getHaccpPlanIdHandler } from '../app/api/v1/haccp/[plan_id]/route';
import { GET as getRestaurantIdHandler } from '../app/api/v1/restaurants/[restaurant_id]/route';
import { POST as claimRestaurantHandler } from '../app/api/v1/restaurants/[restaurant_id]/claim/route';

interface AuditResult {
  route: string;
  method: string;
  authRequired: boolean;
  unauthStatus?: number;
  unauthCode?: string;
  unauthPassed: boolean;
  authStatus?: number;
  authCode?: string;
  authPassed: boolean;
  leaksRawDetails: boolean;
  notes: string;
}

const auditResults: AuditResult[] = [];

function checkErrorLeakage(bodyText: string): { leaks: boolean; reason?: string } {
  const sensitivePatterns = [
    { pattern: /SELECT\s+.+\s+FROM/i, name: 'raw SQL SELECT statement' },
    { pattern: /INSERT\s+INTO/i, name: 'raw SQL INSERT statement' },
    { pattern: /UPDATE\s+.+\s+SET/i, name: 'raw SQL UPDATE statement' },
    { pattern: /DELETE\s+FROM/i, name: 'raw SQL DELETE statement' },
    { pattern: /relation "[^"]+" does not exist/i, name: 'raw PostgreSQL table error' },
    { pattern: /column "[^"]+" does not exist/i, name: 'raw PostgreSQL column error' },
    { pattern: /table "[^"]+"/i, name: 'raw table identifier' },
    { pattern: /violates .+ constraint/i, name: 'raw PostgreSQL constraint violation' },
    { pattern: /unique constraint/i, name: 'raw PostgreSQL unique constraint' },
    { pattern: /ECONNREFUSED/i, name: 'raw database connection string/code' },
    { pattern: /postgresql:\/\//i, name: 'database connection URL' },
    { pattern: /\bat\s+[A-Za-z0-9_.]+\s+\(/, name: 'JavaScript stack trace' }
  ];

  for (const { pattern, name } of sensitivePatterns) {
    if (pattern.test(bodyText)) {
      return { leaks: true, reason: name };
    }
  }
  return { leaks: false };
}

async function runProductionFailClosedTests() {
  console.log('========================================================================');
  console.log('FOODSAFE365 — STAGE 5F: PRODUCTION FAIL-CLOSED SAFETY & DDL AUDIT');
  console.log('========================================================================');

  // Enforce production mode without DATABASE_URL
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  (process.env as any).NODE_ENV = 'production';
  delete process.env.DATABASE_URL;
  process.env.SESSION_SECRET = require('crypto').randomBytes(32).toString('hex');

  console.log(`\n--- SECTION A: FAIL-CLOSED HTTP AUDIT (NODE_ENV=production, DATABASE_URL=unset) ---\n`);

  // Valid restaurant session
  const validManagerToken = createSessionToken({
    userId: '00000000-0000-0000-0000-000000000001',
    organisationId: '00000000-0000-0000-0000-000000000002',
    outletId: '00000000-0000-0000-0000-000000000003',
    role: 'outlet_manager',
    journey: 'restaurant'
  });

  // Valid grocery session
  const validGroceryToken = createSessionToken({
    userId: 'mgr-store-nature-basket-bandra',
    organisationId: 'org-nature-fresh',
    outletId: 'store-nature-basket-bandra',
    role: 'outlet_manager',
    journey: 'grocery'
  });

  // Test 1: Public Reference Routes (No auth required, must fail-closed in production)
  const publicRoutes = [
    { name: 'GET /api/v1/restaurant-types', handler: () => getRestaurantTypesHandler() },
    { name: 'GET /api/v1/food-processes', handler: () => getFoodProcessesHandler() },
    { name: 'GET /api/v1/equipment-types', handler: () => getEquipmentTypesHandler() }
  ];

  for (const r of publicRoutes) {
    const res = await r.handler();
    const json = await res.json();
    const bodyStr = JSON.stringify(json);
    const leakCheck = checkErrorLeakage(bodyStr);

    const isFailClosed = res.status === 500 && json.error?.code === 'CONFIGURATION_ERROR';
    assert.strictEqual(isFailClosed, true, `${r.name} must return 500 CONFIGURATION_ERROR in production without DB`);
    assert.strictEqual(leakCheck.leaks, false, `${r.name} must not leak internal errors: ${leakCheck.reason}`);

    auditResults.push({
      route: r.name,
      method: 'GET',
      authRequired: false,
      unauthPassed: true,
      authStatus: res.status,
      authCode: json.error?.code,
      authPassed: isFailClosed,
      leaksRawDetails: leakCheck.leaks,
      notes: 'Fails closed with 500 CONFIGURATION_ERROR (refuses fallback demo data)'
    });
    console.log(`  ✓ ${r.name} -> HTTP ${res.status} [${json.error?.code}] (Fail-closed verified)`);
  }

  // Test 2: Restaurant Check Execution Routes
  const outletId = '00000000-0000-0000-0000-000000000003';
  const checkId = '00000000-0000-0000-0000-000000000010';

  const checkExecutionRoutes = [
    {
      name: `GET /api/v1/outlets/${outletId}`,
      method: 'GET',
      call: (cookie?: string) => getOutletHandler(
        new Request(`http://localhost/api/v1/outlets/${outletId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { outlet_id: outletId } }
      )
    },
    {
      name: `GET /api/v1/outlets/${outletId}/checks/today`,
      method: 'GET',
      call: (cookie?: string) => getTodayChecksHandler(
        new Request(`http://localhost/api/v1/outlets/${outletId}/checks/today`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { outlet_id: outletId } }
      )
    },
    {
      name: `GET /api/v1/outlets/${outletId}/check-plan`,
      method: 'GET',
      call: (cookie?: string) => getCheckPlanHandler(
        new Request(`http://localhost/api/v1/outlets/${outletId}/check-plan`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { outlet_id: outletId } }
      )
    },
    {
      name: `GET /api/v1/outlets/${outletId}/applicable-rules`,
      method: 'GET',
      call: (cookie?: string) => getApplicableRulesHandler(
        new Request(`http://localhost/api/v1/outlets/${outletId}/applicable-rules`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { outlet_id: outletId } }
      )
    },
    {
      name: `GET /api/v1/checks/${checkId}`,
      method: 'GET',
      call: (cookie?: string) => getCheckHandler(
        new Request(`http://localhost/api/v1/checks/${checkId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { check_id: checkId } }
      )
    },
    {
      name: `POST /api/v1/checks/${checkId}/start`,
      method: 'POST',
      call: (cookie?: string) => startCheckHandler(
        new Request(`http://localhost/api/v1/checks/${checkId}/start`, {
          method: 'POST',
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { check_id: checkId } }
      )
    },
    {
      name: `POST /api/v1/checks/${checkId}/responses`,
      method: 'POST',
      call: (cookie?: string) => checkResponsesHandler(
        new Request(`http://localhost/api/v1/checks/${checkId}/responses`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({ item_id: '55555555-5555-5555-5555-555555555501', response_value: 'pass' })
        }),
        { params: { check_id: checkId } }
      )
    },
    {
      name: `GET /api/v1/dashboard/today`,
      method: 'GET',
      call: (cookie?: string) => getDashboardTodayHandler(
        new Request(`http://localhost/api/v1/dashboard/today?outlet_id=${outletId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: `POST /api/v1/evidence`,
      method: 'POST',
      call: (cookie?: string) => postEvidenceHandler(
        new Request(`http://localhost/api/v1/evidence`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outlet_id: outletId,
            entity_type: 'observation',
            entity_id: '00000000-0000-0000-0000-000000000020',
            file_url: 'upload://evidence/sample.jpg',
            file_type: 'image/jpeg',
            file_size: 1024
          })
        })
      )
    },
    {
      name: `GET /api/v1/records`,
      method: 'GET',
      call: (cookie?: string) => getRecordsHandler(
        new Request(`http://localhost/api/v1/records?outlet_id=${outletId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: `GET /api/v1/haccp`,
      method: 'GET',
      call: (cookie?: string) => getHaccpHandler(
        new Request(`http://localhost/api/v1/haccp?outlet_id=${outletId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: `POST /api/v1/haccp`,
      method: 'POST',
      call: (cookie?: string) => postHaccpHandler(
        new Request(`http://localhost/api/v1/haccp`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId,
            foodCategory: 'general_foodservice',
            scopeDescription: 'Test HACCP plan'
          })
        })
      )
    },
    {
      name: `GET /api/v1/haccp/plan-123`,
      method: 'GET',
      call: (cookie?: string) => getHaccpPlanIdHandler(
        new Request(`http://localhost/api/v1/haccp/plan-123`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        }),
        { params: { plan_id: 'plan-123' } }
      )
    }
  ];

  for (const r of checkExecutionRoutes) {
    // 1. Unauthenticated test (must return 401 UNAUTHENTICATED)
    const unauthRes = await r.call();
    const unauthJson = await unauthRes.json();
    assert.strictEqual(
      unauthRes.status,
      401,
      `${r.name} unauthenticated request must return HTTP 401, got ${unauthRes.status}`
    );
    assert.strictEqual(
      unauthJson.error?.code,
      'UNAUTHENTICATED',
      `${r.name} unauthenticated code must be UNAUTHENTICATED`
    );

    // 2. Authenticated test in production without DB (must return 500 CONFIGURATION_ERROR)
    const authRes = await r.call(validManagerToken);
    const authJson = await authRes.json();
    const leakCheck = checkErrorLeakage(JSON.stringify(authJson));

    assert.strictEqual(
      authRes.status,
      500,
      `${r.name} authenticated request in production without DB must return HTTP 500, got ${authRes.status}`
    );
    assert.strictEqual(
      authJson.error?.code,
      'CONFIGURATION_ERROR',
      `${r.name} error code must be CONFIGURATION_ERROR`
    );
    assert.strictEqual(leakCheck.leaks, false, `${r.name} must not leak sensitive error details`);

    auditResults.push({
      route: r.name,
      method: r.method,
      authRequired: true,
      unauthStatus: unauthRes.status,
      unauthCode: unauthJson.error?.code,
      unauthPassed: true,
      authStatus: authRes.status,
      authCode: authJson.error?.code,
      authPassed: true,
      leaksRawDetails: leakCheck.leaks,
      notes: 'Preserves 401 on unauthenticated call; returns 500 CONFIGURATION_ERROR when authenticated'
    });
    console.log(`  ✓ ${r.name} -> Unauth 401 [UNAUTHENTICATED] | Auth 500 [CONFIGURATION_ERROR] (Verified)`);
  }

  // Test 3: Grocery Operational Routes
  const groceryStoreId = 'store-nature-basket-bandra';
  const groceryRoutes = [
    {
      name: 'GET /api/v1/grocery/daily-check',
      method: 'GET',
      call: (cookie?: string) => getGroceryDailyCheckHandler(
        new Request(`http://localhost/api/v1/grocery/daily-check?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'POST /api/v1/grocery/daily-check',
      method: 'POST',
      call: (cookie?: string) => postGroceryDailyCheckHandler(
        new Request(`http://localhost/api/v1/grocery/daily-check`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId: groceryStoreId,
            supervisorName: 'Duty Supervisor',
            responses: { 'chk-grocery-01': 'pass' }
          })
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/storage',
      method: 'GET',
      call: (cookie?: string) => getGroceryStorageHandler(
        new Request(`http://localhost/api/v1/grocery/storage?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'POST /api/v1/grocery/storage',
      method: 'POST',
      call: (cookie?: string) => postGroceryStorageHandler(
        new Request(`http://localhost/api/v1/grocery/storage`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId: groceryStoreId,
            name: 'Dairy Cold Room',
            type: 'cold_storage',
            targetTemp: 4
          })
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/alerts',
      method: 'GET',
      call: (cookie?: string) => getGroceryAlertsHandler(
        new Request(`http://localhost/api/v1/grocery/alerts?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/dashboard',
      method: 'GET',
      call: (cookie?: string) => getGroceryDashboardHandler(
        new Request(`http://localhost/api/v1/grocery/dashboard?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/receiving',
      method: 'GET',
      call: (cookie?: string) => getGroceryReceivingHandler(
        new Request(`http://localhost/api/v1/grocery/receiving?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'POST /api/v1/grocery/receiving',
      method: 'POST',
      call: (cookie?: string) => postGroceryReceivingHandler(
        new Request(`http://localhost/api/v1/grocery/receiving`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId: groceryStoreId,
            supplier: 'Amul Dairy Dist',
            product: 'Full Cream Milk 500ml',
            quantity: '50 crates',
            productCategory: 'dairy_milk'
          })
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/stock',
      method: 'GET',
      call: (cookie?: string) => getGroceryStockHandler(
        new Request(`http://localhost/api/v1/grocery/stock?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'POST /api/v1/grocery/stock',
      method: 'POST',
      call: (cookie?: string) => postGroceryStockHandler(
        new Request(`http://localhost/api/v1/grocery/stock`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId: groceryStoreId,
            action: 'quarantine_batch',
            batchNumber: 'BATCH-2026-001',
            reason: 'Suspected temp abuse'
          })
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/temperature',
      method: 'GET',
      call: (cookie?: string) => getGroceryTemperatureHandler(
        new Request(`http://localhost/api/v1/grocery/temperature?outletId=${groceryStoreId}`, {
          headers: cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {}
        })
      )
    },
    {
      name: 'POST /api/v1/grocery/temperature',
      method: 'POST',
      call: (cookie?: string) => postGroceryTemperatureHandler(
        new Request(`http://localhost/api/v1/grocery/temperature`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(cookie ? { cookie: `${SESSION_COOKIE_NAME}=${cookie}` } : {})
          },
          body: JSON.stringify({
            outletId: groceryStoreId,
            equipmentId: 'equip-nature-chiller-1',
            reading: 3.5,
            recordedBy: 'Duty Supervisor'
          })
        })
      )
    }
  ];

  for (const r of groceryRoutes) {
    // 1. Unauthenticated test (must return 401 UNAUTHENTICATED)
    const unauthRes = await r.call();
    const unauthJson = await unauthRes.json();
    assert.strictEqual(
      unauthRes.status,
      401,
      `${r.name} unauthenticated request must return HTTP 401, got ${unauthRes.status}`
    );

    // 2. Authenticated test in production without DB (must fail-closed with 500 DATABASE_ERROR)
    const authRes = await r.call(validGroceryToken);
    const authJson = await authRes.json();
    const leakCheck = checkErrorLeakage(JSON.stringify(authJson));

    assert.strictEqual(
      authRes.status,
      500,
      `${r.name} authenticated request in production without DB must return HTTP 500, got ${authRes.status}`
    );
    assert.strictEqual(
      authJson.error?.code === 'DATABASE_ERROR' || authJson.error?.code === 'CONFIGURATION_ERROR',
      true,
      `${r.name} error code must indicate database/config failure, got ${authJson.error?.code}`
    );
    assert.strictEqual(leakCheck.leaks, false, `${r.name} must not leak sensitive error details`);

    auditResults.push({
      route: r.name,
      method: r.method,
      authRequired: true,
      unauthStatus: unauthRes.status,
      unauthCode: unauthJson.error?.code,
      unauthPassed: true,
      authStatus: authRes.status,
      authCode: authJson.error?.code,
      authPassed: true,
      leaksRawDetails: leakCheck.leaks,
      notes: 'Preserves 401 on unauthenticated call; returns 500 DATABASE_ERROR when authenticated'
    });
    console.log(`  ✓ ${r.name} -> Unauth 401 [UNAUTHENTICATED] | Auth 500 [${authJson.error?.code}] (Fail-closed verified)`);
  }

  console.log(`\n--- SECTION A2: FAIL-CLOSED WITH CONFIGURED BUT UNAVAILABLE DATABASE ---\n`);

  process.env.DATABASE_URL = 'postgresql://app_user:SecurePassword123@db.foodsafe365.internal:5432/foodsafe_prod';
  resetPool();

  const unavailableDbRoutes = [
    {
      name: 'GET /api/v1/restaurant-types (Unavailable DB)',
      call: () => getRestaurantTypesHandler()
    },
    {
      name: 'GET /api/v1/outlets/[outlet_id]/checks/today (Unavailable DB)',
      call: () => getTodayChecksHandler(
        new Request(`http://localhost/api/v1/outlets/${outletId}/checks/today`, {
          headers: { cookie: `${SESSION_COOKIE_NAME}=${validManagerToken}` }
        }),
        { params: { outlet_id: outletId } }
      )
    },
    {
      name: 'GET /api/v1/checks/[check_id] (Unavailable DB)',
      call: () => getCheckHandler(
        new Request(`http://localhost/api/v1/checks/${checkId}`, {
          headers: { cookie: `${SESSION_COOKIE_NAME}=${validManagerToken}` }
        }),
        { params: { check_id: checkId } }
      )
    },
    {
      name: 'POST /api/v1/evidence (Unavailable DB)',
      call: () => postEvidenceHandler(
        new Request(`http://localhost/api/v1/evidence`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: `${SESSION_COOKIE_NAME}=${validManagerToken}`
          },
          body: JSON.stringify({
            outlet_id: outletId,
            entity_type: 'observation',
            entity_id: '00000000-0000-0000-0000-000000000020',
            file_url: 'upload://evidence/sample.jpg',
            file_type: 'image/jpeg',
            file_size: 1024
          })
        })
      )
    },
    {
      name: 'GET /api/v1/records (Unavailable DB)',
      call: () => getRecordsHandler(
        new Request(`http://localhost/api/v1/records?outlet_id=${outletId}`, {
          headers: { cookie: `${SESSION_COOKIE_NAME}=${validManagerToken}` }
        })
      )
    },
    {
      name: 'GET /api/v1/grocery/daily-check (Unavailable DB)',
      call: () => getGroceryDailyCheckHandler(
        new Request(`http://localhost/api/v1/grocery/daily-check?outletId=${groceryStoreId}`, {
          headers: { cookie: `${SESSION_COOKIE_NAME}=${validGroceryToken}` }
        })
      )
    }
  ];

  for (const r of unavailableDbRoutes) {
    const res = await r.call();
    const json = await res.json();
    const bodyStr = JSON.stringify(json);
    const leakCheck = checkErrorLeakage(bodyStr);

    assert.strictEqual(res.status, 500, `${r.name} must return 500 on database failure, got ${res.status}`);
    assert.strictEqual(
      json.error?.code === 'DATABASE_ERROR' || json.error?.code === 'CONFIGURATION_ERROR' || json.error?.code === 'INTERNAL_ERROR',
      true,
      `${r.name} error code must be controlled server error, got ${json.error?.code}`
    );
    assert.strictEqual(leakCheck.leaks, false, `${r.name} must not leak connection or driver error details`);
    console.log(`  ✓ ${r.name} -> HTTP ${res.status} [${json.error?.code}] (Controlled fail-closed verified)`);
  }

  resetPool();
  delete process.env.DATABASE_URL;

  // Restore env
  (process.env as any).NODE_ENV = originalNodeEnv;
  if (originalDatabaseUrl) process.env.DATABASE_URL = originalDatabaseUrl;

  console.log(`\n--- SECTION B: ERROR LEAKAGE & SENSITIVE DATA PREVENTION (F-15) ---\n`);

  // Error simulation tests
  const simulatedDbErrors = [
    'error: relation "check_instances" does not exist at Character 15',
    'error: column "non_existent_column" of relation "observations" does not exist',
    'connect ECONNREFUSED 127.0.0.1:5432',
    'DATABASE_ERROR: insert or update on table "check_responses" violates foreign key constraint "fk_instance"',
    'duplicate key value violates unique constraint "rules_rule_code_key"'
  ];

  for (const errStr of simulatedDbErrors) {
    const leak = checkErrorLeakage(errStr);
    assert.strictEqual(leak.leaks, true, `Pattern should detect simulated raw error: ${errStr}`);
  }
  console.log(`  ✓ Error leakage detection patterns validated against simulated raw PostgreSQL driver errors`);

  console.log(`\n--- SECTION C: RUNTIME DDL ELIMINATION AUDIT (F-12) ---\n`);

  const storeFiles = [
    'lib/grocery-store.ts',
    'lib/service-provider-store.ts',
    'lib/customer-feedback-store.ts',
    'app/api/v1/organisations/route.ts',
    'app/api/v1/checks/[check_id]/responses/route.ts',
    'app/api/v1/actions/route.ts'
  ];

  for (const relPath of storeFiles) {
    const fullPath = path.resolve(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Remove comments
    const cleaned = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

    const hasCreateTable = /CREATE\s+TABLE/i.test(cleaned);
    const hasCreateIndex = /CREATE\s+INDEX/i.test(cleaned);
    const hasAlterTable = /ALTER\s+TABLE/i.test(cleaned);
    const hasDropTable = /DROP\s+TABLE/i.test(cleaned);

    const hasRuntimeDDL = hasCreateTable || hasCreateIndex || hasAlterTable || hasDropTable;
    assert.strictEqual(
      hasRuntimeDDL,
      false,
      `File ${relPath} must not contain runtime DDL statements! (CREATE TABLE: ${hasCreateTable}, CREATE INDEX: ${hasCreateIndex})`
    );
    console.log(`  ✓ ${relPath} -> Verified 0 runtime DDL statements`);
  }

  console.log(`\n========================================================================`);
  console.log(`🎯 STAGE 5F AUDIT RESULTS SUMMARY: ${auditResults.length} ROUTES TESTED`);
  console.log(`========================================================================\n`);

  console.log('| Route | Method | Auth Req | Unauth Code | Auth Prod Code | Fail-Closed | Leaks Details |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of auditResults) {
    console.log(`| \`${r.route}\` | ${r.method} | ${r.authRequired ? 'Yes' : 'No'} | ${r.unauthCode || 'N/A'} | ${r.authCode || 'N/A'} | ${r.authPassed ? '✅ YES' : '❌ NO'} | ${r.leaksRawDetails ? '⚠️ LEAKS' : '✅ CLEAN'} |`);
  }
}

runProductionFailClosedTests().catch(err => {
  console.error('\n❌ STAGE 5F TEST RUNNER FAILED:', err);
  process.exit(1);
});
