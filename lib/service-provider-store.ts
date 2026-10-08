import fs from 'fs';
import path from 'path';
import os from 'os';
import { getPool, query } from './db';
import type {
  ServiceCategoryDef,
  ProviderVerificationStatus,
  ServiceProvider,
  ServiceRequestStatus,
  ServiceRequestAuditEntry,
  ServiceRequest
} from './service-provider-contracts';
import { CONTROLLED_SERVICE_CATEGORIES } from './service-provider-contracts';

export type {
  ServiceCategoryDef,
  ProviderVerificationStatus,
  ServiceProvider,
  ServiceRequestStatus,
  ServiceRequestAuditEntry,
  ServiceRequest
};
export { CONTROLLED_SERVICE_CATEGORIES };

const DEFAULT_SEED_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-pest-apex',
    businessName: 'Apex Commercial Pest Control',
    contactName: 'Sunil Verma',
    mobile: '+91 98201 12345',
    email: 'contact@apexpest.example.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    categories: ['pest_control'],
    description: 'Commercial kitchen pest eradication, rodent baiting, and insect light-trap maintenance.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'prov-refrig-frost',
    businessName: 'FrostLine Chillers & Cold Chain',
    contactName: 'Anand Shinde',
    mobile: '+91 98202 23456',
    email: 'service@frostline.example.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    categories: ['refrigeration', 'equipment'],
    description: 'Commercial walk-in chiller, refrigerator, and freezer breakdown maintenance and thermostat calibration.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'prov-clean-ecoclean',
    businessName: 'EcoClean Kitchen Sanitation & Degreasing',
    contactName: 'Farhan Qureshi',
    mobile: '+91 98203 34567',
    email: 'info@ecoclean.example.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    categories: ['deep_cleaning'],
    description: 'Heavy grease exhaust hood scraping, tile grout sanitation, and drain jetting for commercial kitchens.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'prov-water-aquapure',
    businessName: 'AquaPure NABL Water Testing Lab',
    contactName: 'Dr. Meera Iyer',
    mobile: '+91 98204 45678',
    email: 'reports@aquapure.example.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    categories: ['water_testing'],
    description: 'IS 10500 drinking and cooking water potability microbiological testing and physical sample collection.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'prov-pune-pest',
    businessName: 'Pune Kitchen Safe Pest Management',
    contactName: 'Nitin Deshmukh',
    mobile: '+91 98500 56789',
    email: 'contact@pune-pestsafe.example.com',
    city: 'Pune',
    state: 'Maharashtra',
    categories: ['pest_control', 'deep_cleaning'],
    description: 'Food establishment pest perimeter defense and deep hygiene sanitization in Pune area.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'prov-kolkata-refrig',
    businessName: 'Eastern Cold Chain & HVAC Solutions',
    contactName: 'Subir Banerjee',
    mobile: '+91 98300 67890',
    email: 'service@easterncold.example.com',
    city: 'Kolkata',
    state: 'West Bengal',
    categories: ['refrigeration', 'equipment'],
    description: 'Restaurant chiller maintenance, digital temperature sensor calibration, and emergency repairs.',
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
  }
];

const DEFAULT_SEED_REQUESTS: ServiceRequest[] = [];

// Persistent storage paths for DEV/DEMO
function getProvidersFilePath(): string {
  const primaryDir = path.join(process.cwd(), '.data');
  try {
    if (!fs.existsSync(primaryDir)) fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, 'service_providers.json');
  } catch {
    return path.join(os.tmpdir(), 'foodsafe365_service_providers.json');
  }
}

function getRequestsFilePath(): string {
  const primaryDir = path.join(process.cwd(), '.data');
  try {
    if (!fs.existsSync(primaryDir)) fs.mkdirSync(primaryDir, { recursive: true });
    return path.join(primaryDir, 'service_requests.json');
  } catch {
    return path.join(os.tmpdir(), 'foodsafe365_service_requests.json');
  }
}

function readFileStore<T>(filePath: string, defaultData: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    writeFileStore(filePath, defaultData);
    return defaultData;
  } catch {
    return defaultData;
  }
}

function writeFileStore<T>(filePath: string, data: T[]): void {
  try {
    const tmp = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.warn('[service-provider-store] File store write warning:', err);
  }
}

let pgInitialized = false;

async function ensurePgTables(): Promise<boolean> {
  if (pgInitialized) return true;
  const pool = getPool();
  if (!pool) return false;

  // In production, runtime code strictly assumes required schema has already been migrated.
  if (process.env.NODE_ENV === 'production') {
    pgInitialized = true;
    return true;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_providers (
        id text PRIMARY KEY,
        business_name text NOT NULL,
        contact_name text NOT NULL,
        mobile text NOT NULL,
        email text NOT NULL,
        address text,
        city text NOT NULL,
        state text,
        categories text[] NOT NULL,
        description text NOT NULL,
        verification_status text DEFAULT 'unverified',
        status text DEFAULT 'active',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS restaurant_service_requests (
        id text PRIMARY KEY,
        organisation_id text NOT NULL,
        outlet_id text NOT NULL,
        outlet_name text NOT NULL,
        outlet_city text,
        outlet_address text,
        corrective_action_id text NOT NULL,
        corrective_action_title text NOT NULL,
        provider_id text NOT NULL,
        provider_name text NOT NULL,
        service_category text NOT NULL,
        problem_description text NOT NULL,
        priority text DEFAULT 'high',
        contact_person text,
        contact_phone text,
        notes text,
        completion_notes text,
        rejection_notes text,
        status text NOT NULL,
        requested_at timestamptz DEFAULT now(),
        scheduled_at timestamptz NULL,
        completed_at timestamptz NULL,
        confirmed_at timestamptz NULL,
        audit_trail jsonb DEFAULT '[]'::jsonb
      );

      CREATE INDEX IF NOT EXISTS idx_srv_requests_outlet ON restaurant_service_requests(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_srv_requests_provider ON restaurant_service_requests(provider_id);
      CREATE INDEX IF NOT EXISTS idx_srv_requests_action ON restaurant_service_requests(corrective_action_id);
    `);
    pgInitialized = true;
    return true;
  } catch (err) {
    console.error('[service-provider-store] PostgreSQL table initialization failed:', err);
    throw err;
  }
}

function assertNotProductionFileFallback(operation: string): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`DATABASE_ERROR: Production requires configured PostgreSQL DATABASE_URL. Refusing file fallback for "${operation}".`);
  }
}

// -------------------------------------------------------------
// PROVIDERS API METHODS
// -------------------------------------------------------------

export async function listServiceProviders(filter?: { category?: string; city?: string }): Promise<ServiceProvider[]> {
  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('listServiceProviders');
    const list = readFileStore(getProvidersFilePath(), DEFAULT_SEED_PROVIDERS);
    return list.filter(p => {
      if (p.status !== 'active') return false;
      if (filter?.category && filter.category !== 'all' && !p.categories.includes(filter.category)) {
        return false;
      }
      if (filter?.city && filter.city !== 'all') {
        const cA = (p.city || '').toLowerCase();
        const cB = filter.city.toLowerCase();
        if (!cA.includes(cB) && !cB.includes(cA)) return false;
      }
      return true;
    });
  }

  await ensurePgTables();
  const params: any[] = [];
  let where = `status = 'active'`;

  if (filter?.category && filter.category !== 'all') {
    params.push(filter.category);
    where += ` AND $${params.length} = ANY(categories)`;
  }
  if (filter?.city && filter.city !== 'all') {
    params.push(`%${filter.city}%`);
    where += ` AND city ILIKE $${params.length}`;
  }

  const rows = await query<any>(`
    SELECT 
      id, business_name "businessName", contact_name "contactName",
      mobile, email, address, city, state, categories, description,
      verification_status "verificationStatus", status, created_at "createdAt"
    FROM service_providers
    WHERE ${where}
    ORDER BY created_at ASC
  `, params);

  return rows;
}

export async function getServiceProviderById(id: string): Promise<ServiceProvider | null> {
  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('getServiceProviderById');
    const list = readFileStore(getProvidersFilePath(), DEFAULT_SEED_PROVIDERS);
    return list.find(p => p.id === id) || null;
  }

  await ensurePgTables();
  const rows = await query<any>(`
    SELECT 
      id, business_name "businessName", contact_name "contactName",
      mobile, email, address, city, state, categories, description,
      verification_status "verificationStatus", status, created_at "createdAt"
    FROM service_providers
    WHERE id = $1
  `, [id]);

  return rows[0] || null;
}

export async function registerServiceProvider(data: Partial<ServiceProvider>): Promise<ServiceProvider> {
  const id = data.id || `prov-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const provider: ServiceProvider = {
    id,
    businessName: (data.businessName || '').trim(),
    contactName: (data.contactName || '').trim(),
    mobile: (data.mobile || '').trim(),
    email: (data.email || '').trim(),
    address: data.address?.trim() || '',
    city: (data.city || 'Mumbai').trim(),
    state: data.state?.trim() || 'Maharashtra',
    categories: Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : ['deep_cleaning'],
    description: (data.description || 'Food-safety service provider.').trim(),
    verificationStatus: 'unverified',
    status: 'active',
    createdAt: now
  };

  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('registerServiceProvider');
    const list = readFileStore(getProvidersFilePath(), DEFAULT_SEED_PROVIDERS);
    list.unshift(provider);
    writeFileStore(getProvidersFilePath(), list);
    return provider;
  }

  await ensurePgTables();
  await query(`
    INSERT INTO service_providers(
      id, business_name, contact_name, mobile, email, address, city, state,
      categories, description, verification_status, status, created_at
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
  `, [
    provider.id, provider.businessName, provider.contactName, provider.mobile, provider.email,
    provider.address, provider.city, provider.state, provider.categories, provider.description,
    provider.verificationStatus, provider.status
  ]);

  return provider;
}

// -------------------------------------------------------------
// SERVICE REQUESTS API METHODS
// -------------------------------------------------------------

export async function listServiceRequests(filter: {
  outletId?: string;
  providerId?: string;
  correctiveActionId?: string;
}): Promise<ServiceRequest[]> {
  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('listServiceRequests');
    const list = readFileStore(getRequestsFilePath(), DEFAULT_SEED_REQUESTS);
    return list.filter(r => {
      if (filter.outletId && r.outletId !== filter.outletId) return false;
      if (filter.providerId && r.providerId !== filter.providerId) return false;
      if (filter.correctiveActionId && r.correctiveActionId !== filter.correctiveActionId) return false;
      return true;
    }).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }

  await ensurePgTables();
  const params: any[] = [];
  const whereClauses: string[] = [];

  if (filter.outletId) {
    params.push(filter.outletId);
    whereClauses.push(`outlet_id = $${params.length}`);
  }
  if (filter.providerId) {
    params.push(filter.providerId);
    whereClauses.push(`provider_id = $${params.length}`);
  }
  if (filter.correctiveActionId) {
    params.push(filter.correctiveActionId);
    whereClauses.push(`corrective_action_id = $${params.length}`);
  }

  const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const rows = await query<any>(`
    SELECT 
      id, organisation_id "organisationId", outlet_id "outletId", outlet_name "outletName",
      outlet_city "outletCity", outlet_address "outletAddress",
      corrective_action_id "correctiveActionId",
      corrective_action_title "correctiveActionTitle", provider_id "providerId",
      provider_name "providerName", service_category "serviceCategory",
      problem_description "problemDescription", priority, contact_person "contactPerson",
      contact_phone "contactPhone", notes, completion_notes "completionNotes",
      rejection_notes "rejectionNotes", status,
      requested_at "requestedAt", scheduled_at "scheduledAt",
      completed_at "completedAt", confirmed_at "confirmedAt",
      audit_trail "auditTrail"
    FROM restaurant_service_requests
    ${where}
    ORDER BY requested_at DESC
  `, params);

  return rows;
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest | null> {
  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('getServiceRequestById');
    const list = readFileStore(getRequestsFilePath(), DEFAULT_SEED_REQUESTS);
    return list.find(r => r.id === id) || null;
  }

  await ensurePgTables();
  const rows = await query<any>(`
    SELECT 
      id, organisation_id "organisationId", outlet_id "outletId", outlet_name "outletName",
      outlet_city "outletCity", outlet_address "outletAddress",
      corrective_action_id "correctiveActionId",
      corrective_action_title "correctiveActionTitle", provider_id "providerId",
      provider_name "providerName", service_category "serviceCategory",
      problem_description "problemDescription", priority, contact_person "contactPerson",
      contact_phone "contactPhone", notes, completion_notes "completionNotes",
      rejection_notes "rejectionNotes", status,
      requested_at "requestedAt", scheduled_at "scheduledAt",
      completed_at "completedAt", confirmed_at "confirmedAt",
      audit_trail "auditTrail"
    FROM restaurant_service_requests
    WHERE id = $1
  `, [id]);

  return rows[0] || null;
}

export async function createServiceRequest(data: {
  organisationId: string;
  outletId: string;
  outletName: string;
  outletCity?: string;
  outletAddress?: string;
  correctiveActionId: string;
  correctiveActionTitle: string;
  providerId: string;
  providerName: string;
  serviceCategory: string;
  problemDescription: string;
  priority?: 'critical' | 'high' | 'medium' | 'low' | string;
  contactPerson?: string;
  contactPhone?: string;
  notes?: string;
  scheduledAt?: string;
}): Promise<ServiceRequest> {
  const id = `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  const initialAudit: ServiceRequestAuditEntry[] = [
    {
      timestamp: now,
      user: data.contactPerson || 'Restaurant Team',
      action: 'Created service request',
      status: 'requested',
      notes: data.problemDescription
    }
  ];

  const request: ServiceRequest = {
    id,
    organisationId: data.organisationId,
    outletId: data.outletId,
    outletName: data.outletName,
    outletCity: data.outletCity || 'Mumbai',
    outletAddress: data.outletAddress || '',
    correctiveActionId: data.correctiveActionId,
    correctiveActionTitle: data.correctiveActionTitle,
    providerId: data.providerId,
    providerName: data.providerName,
    serviceCategory: data.serviceCategory,
    problemDescription: data.problemDescription,
    priority: data.priority || 'high',
    contactPerson: data.contactPerson || 'Duty Manager',
    contactPhone: data.contactPhone || '',
    notes: data.notes || '',
    status: 'requested',
    requestedAt: now,
    scheduledAt: data.scheduledAt || null,
    completedAt: null,
    confirmedAt: null,
    auditTrail: initialAudit
  };

  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('createServiceRequest');
    const list = readFileStore(getRequestsFilePath(), DEFAULT_SEED_REQUESTS);
    list.unshift(request);
    writeFileStore(getRequestsFilePath(), list);
    return request;
  }

  await ensurePgTables();
  await query(`
    INSERT INTO restaurant_service_requests(
      id, organisation_id, outlet_id, outlet_name, outlet_city, outlet_address,
      corrective_action_id, corrective_action_title, provider_id, provider_name,
      service_category, problem_description, priority, contact_person, contact_phone,
      notes, status, requested_at, scheduled_at, audit_trail
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'requested', now(), $17, $18)
  `, [
    request.id, request.organisationId, request.outletId, request.outletName, request.outletCity,
    request.outletAddress, request.correctiveActionId, request.correctiveActionTitle, request.providerId,
    request.providerName, request.serviceCategory, request.problemDescription, request.priority,
    request.contactPerson, request.contactPhone, request.notes, request.scheduledAt,
    JSON.stringify(initialAudit)
  ]);

  return request;
}

export async function updateServiceRequestStatus(
  id: string,
  newStatus: ServiceRequestStatus,
  notes?: string,
  actor?: string
): Promise<ServiceRequest | null> {
  const now = new Date().toISOString();

  const existing = await getServiceRequestById(id);
  if (!existing) return null;

  const isRejection = existing.status === 'completed' && newStatus === 'in_progress';

  const actionMap: Record<ServiceRequestStatus, string> = {
    requested: 'Created service request',
    accepted: 'Provider accepted request',
    declined: 'Provider declined request',
    in_progress: isRejection ? 'Returned for further action' : 'Provider started service',
    completed: 'Provider completed service',
    restaurant_confirmed: 'Restaurant verified completion',
    cancelled: 'Request cancelled'
  };

  const auditEntry: ServiceRequestAuditEntry = {
    timestamp: now,
    user: actor || (newStatus === 'restaurant_confirmed' ? 'Restaurant Manager' : 'Service Provider'),
    action: actionMap[newStatus] || `Status updated to ${newStatus}`,
    status: newStatus,
    notes: notes || undefined
  };

  if (!process.env.DATABASE_URL) {
    assertNotProductionFileFallback('updateServiceRequestStatus');
    const list = readFileStore(getRequestsFilePath(), DEFAULT_SEED_REQUESTS);
    const item = list.find(r => r.id === id);
    if (!item) return null;
    item.status = newStatus;
    if (notes) item.notes = notes;
    if (newStatus === 'completed') {
      if (!item.completedAt) item.completedAt = now;
      if (notes) item.completionNotes = notes;
    }
    if (newStatus === 'restaurant_confirmed' && !item.confirmedAt) {
      item.confirmedAt = now;
    }
    if (isRejection && notes) {
      item.rejectionNotes = notes;
    }

    if (!item.auditTrail) item.auditTrail = [];
    item.auditTrail.push(auditEntry);

    writeFileStore(getRequestsFilePath(), list);
    return item;
  }

  await ensurePgTables();
  const sets: string[] = ['status = $2'];
  const params: any[] = [id, newStatus];

  if (notes) {
    params.push(notes);
    sets.push(`notes = $${params.length}`);
  }
  if (newStatus === 'completed') {
    sets.push(`completed_at = COALESCE(completed_at, now())`);
    if (notes) {
      params.push(notes);
      sets.push(`completion_notes = $${params.length}`);
    }
  }
  if (newStatus === 'restaurant_confirmed') {
    sets.push(`confirmed_at = COALESCE(confirmed_at, now())`);
  }
  if (isRejection && notes) {
    params.push(notes);
    sets.push(`rejection_notes = $${params.length}`);
  }

  // Append to audit_trail jsonb
  params.push(JSON.stringify(auditEntry));
  sets.push(`audit_trail = COALESCE(audit_trail, '[]'::jsonb) || $${params.length}::jsonb`);

  const rows = await query<any>(`
    UPDATE restaurant_service_requests
    SET ${sets.join(', ')}
    WHERE id = $1
    RETURNING 
      id, organisation_id "organisationId", outlet_id "outletId", outlet_name "outletName",
      outlet_city "outletCity", outlet_address "outletAddress",
      corrective_action_id "correctiveActionId",
      corrective_action_title "correctiveActionTitle", provider_id "providerId",
      provider_name "providerName", service_category "serviceCategory",
      problem_description "problemDescription", priority, contact_person "contactPerson",
      contact_phone "contactPhone", notes, completion_notes "completionNotes",
      rejection_notes "rejectionNotes", status,
      requested_at "requestedAt", scheduled_at "scheduledAt",
      completed_at "completedAt", confirmed_at "confirmedAt",
      audit_trail "auditTrail"
  `, params);

  return rows[0] || null;
}
