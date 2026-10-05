import fs from 'fs';
import path from 'path';
import os from 'os';
import { getPool, query } from './db';
import { DinerSafetyRating } from './foodsafety28';

export interface FeedbackStorageResult {
  ratings: DinerSafetyRating[];
  storage: 'postgresql' | 'server_file';
  count: number;
}

const DEFAULT_SEED_RATINGS: DinerSafetyRating[] = [
  {
    id: 'seed-rating-table-1',
    outletId: 'the-table',
    outletName: 'The Table (Colaba)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    dinerName: 'Priya M.',
    dinerMobile: '+91 98201 ****5',
    tableNumber: 'Table 04',
    scores: {
      cleanliness: 5,
      staffHygiene: 4,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 4
    },
    overallScore: 4.6,
    feedback: 'Excellent dining experience and sparkling clean cutlery. Staff wore clean aprons.',
    verifiedDineIn: true
  },
  {
    id: 'seed-rating-table-2',
    outletId: 'the-table',
    outletName: 'The Table (Colaba)',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    dinerName: 'Rohan K.',
    dinerMobile: '+91 98110 ****1',
    tableNumber: 'Table 11',
    scores: {
      cleanliness: 4,
      staffHygiene: 3,
      foodFreshness: 4,
      safeWater: 5,
      washroom: 4
    },
    overallScore: 4.0,
    feedback: 'Server had long fingernails and was not wearing a hair restraint during dessert service.',
    verifiedDineIn: true
  },
  {
    id: 'seed-rating-bastian-1',
    outletId: 'bastian-mumbai',
    outletName: 'Bastian (Bandra West)',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    dinerName: 'Vikram S.',
    dinerMobile: '+91 98200 ****1',
    tableNumber: 'Table 07',
    scores: {
      cleanliness: 4,
      staffHygiene: 4,
      foodFreshness: 3,
      safeWater: 4,
      washroom: 4
    },
    overallScore: 3.8,
    feedback: 'Seafood platter did not seem ice-cold upon arrival at the table.',
    verifiedDineIn: true
  },
  {
    id: 'seed-rating-leopold-1',
    outletId: 'leopold-cafe',
    outletName: 'Leopold Cafe & Bar',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    dinerName: 'Arjun S.',
    dinerMobile: '+91 98200 ****2',
    tableNumber: 'Table QR #1',
    scores: {
      cleanliness: 5,
      staffHygiene: 4,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 4
    },
    overallScore: 4.6,
    feedback: 'TEST LEOPOLD 123 — please confirm this feedback appears in manager dashboard',
    verifiedDineIn: true
  }
];

declare global {
  var __foodsafe_feedback_store: DinerSafetyRating[] | undefined;
}

// Helper to determine persistent storage file path (LOCAL DEV ONLY)
function getFilePath(): string {
  const primaryDir = path.join(process.cwd(), '.data');
  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    return path.join(primaryDir, 'customer_feedback.json');
  } catch {
    return path.join(os.tmpdir(), 'foodsafe365_customer_feedback.json');
  }
}

// Read from persistent server file (DEV ONLY)
function readFileStore(): DinerSafetyRating[] {
  if (globalThis.__foodsafe_feedback_store && globalThis.__foodsafe_feedback_store.length > 0) {
    return globalThis.__foodsafe_feedback_store;
  }
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__foodsafe_feedback_store = parsed;
        return parsed;
      }
    }
    writeFileStore(DEFAULT_SEED_RATINGS);
    globalThis.__foodsafe_feedback_store = DEFAULT_SEED_RATINGS;
    return DEFAULT_SEED_RATINGS;
  } catch (err) {
    console.warn('[customer-feedback-store] Error reading dev file store:', err);
    return globalThis.__foodsafe_feedback_store || DEFAULT_SEED_RATINGS;
  }
}

// Write to persistent server file atomically (DEV ONLY)
function writeFileStore(ratings: DinerSafetyRating[]): void {
  globalThis.__foodsafe_feedback_store = ratings;
  const filePath = getFilePath();
  try {
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(ratings, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.warn('[customer-feedback-store] Error writing dev file store:', err);
  }
}

let pgInitialized = false;

async function ensurePgTable(): Promise<boolean> {
  if (pgInitialized) return true;
  const pool = getPool();
  if (!pool) return false;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id text PRIMARY KEY,
        outlet_id text NOT NULL,
        outlet_name text NOT NULL,
        overall_score numeric(3,2) NOT NULL,
        cleanliness_score numeric(3,2) NOT NULL,
        staff_hygiene_score numeric(3,2) NOT NULL,
        food_freshness_score numeric(3,2) NOT NULL,
        safe_water_score numeric(3,2) NOT NULL,
        washroom_score numeric(3,2) NOT NULL,
        feedback text,
        diner_name text,
        diner_mobile text,
        table_number text,
        verified_dine_in boolean DEFAULT true,
        created_at timestamptz DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_customer_feedback_outlet ON customer_feedback(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_customer_feedback_created ON customer_feedback(created_at DESC);
    `);
    pgInitialized = true;
    return true;
  } catch (err) {
    console.error('[customer-feedback-store] PostgreSQL table initialization failed:', err);
    throw err;
  }
}

function mapPgRowToRating(r: any): DinerSafetyRating {
  return {
    id: r.id,
    outletId: r.outlet_id,
    outletName: r.outlet_name,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    dinerName: r.diner_name || undefined,
    dinerMobile: r.diner_mobile || undefined,
    tableNumber: r.table_number || undefined,
    scores: {
      cleanliness: Number(r.cleanliness_score || 0),
      staffHygiene: Number(r.staff_hygiene_score || 0),
      foodFreshness: Number(r.food_freshness_score || 0),
      safeWater: Number(r.safe_water_score || 0),
      washroom: Number(r.washroom_score || 0),
    },
    overallScore: Number(r.overall_score || 0),
    feedback: r.feedback || '',
    verifiedDineIn: Boolean(r.verified_dine_in),
  };
}

/**
 * Retrieve customer food-safety ratings by outletId.
 * In PRODUCTION (when DATABASE_URL is set): PostgreSQL is the SOLE authoritative store.
 * If PostgreSQL query fails, it throws a database error (no silent JSON fallback).
 * In LOCAL DEV / DEMO (when DATABASE_URL is unset): Uses .data/customer_feedback.json.
 */
export async function getCustomerFeedback(outletId?: string | null): Promise<FeedbackStorageResult> {
  const targetOutlet = outletId && outletId !== 'all' ? outletId.trim() : null;

  // 1. PRODUCTION MODE: PostgreSQL is authoritative
  if (process.env.DATABASE_URL) {
    try {
      await ensurePgTable();
      let querySql = `SELECT * FROM customer_feedback`;
      const params: any[] = [];
      if (targetOutlet) {
        querySql += ` WHERE outlet_id = $1`;
        params.push(targetOutlet);
      }
      querySql += ` ORDER BY created_at DESC`;

      const rows = await query<any>(querySql, params);
      const ratings = rows.map(mapPgRowToRating);
      return { ratings, storage: 'postgresql', count: ratings.length };
    } catch (err: any) {
      console.error('[customer-feedback-store] Production PostgreSQL query error:', err);
      // Hard failure in production — do NOT silently fall back to JSON
      throw new Error(`DATABASE_ERROR: ${err.message || 'PostgreSQL read operation failed'}`);
    }
  }

  // 2. DEVELOPMENT / DEMO MODE (DATABASE_URL unset only)
  const allRatings = readFileStore();
  const filtered = targetOutlet
    ? allRatings.filter(r => r.outletId === targetOutlet)
    : allRatings;

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    ratings: filtered,
    storage: 'server_file',
    count: filtered.length
  };
}

/**
 * Save a new Customer Food-Safety Rating.
 * In PRODUCTION (when DATABASE_URL is set): Persists exclusively to PostgreSQL.
 * If PostgreSQL insert fails, it throws a database error (no silent JSON fallback).
 * In LOCAL DEV / DEMO (when DATABASE_URL is unset): Saves to .data/customer_feedback.json.
 */
export async function saveCustomerFeedback(rating: DinerSafetyRating): Promise<{ rating: DinerSafetyRating; storage: 'postgresql' | 'server_file' }> {
  // 1. PRODUCTION MODE: PostgreSQL is authoritative
  if (process.env.DATABASE_URL) {
    try {
      await ensurePgTable();
      await query(
        `INSERT INTO customer_feedback (
          id, outlet_id, outlet_name, overall_score, cleanliness_score, staff_hygiene_score,
          food_freshness_score, safe_water_score, washroom_score, feedback, diner_name,
          diner_mobile, table_number, verified_dine_in, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          rating.id,
          rating.outletId,
          rating.outletName,
          rating.overallScore,
          rating.scores.cleanliness,
          rating.scores.staffHygiene,
          rating.scores.foodFreshness,
          rating.scores.safeWater,
          rating.scores.washroom,
          rating.feedback || null,
          rating.dinerName || null,
          rating.dinerMobile || null,
          rating.tableNumber || null,
          rating.verifiedDineIn ?? true,
          rating.createdAt || new Date().toISOString()
        ]
      );
      return { rating, storage: 'postgresql' };
    } catch (err: any) {
      console.error('[customer-feedback-store] Production PostgreSQL insert error:', err);
      // Hard failure in production — do NOT silently fall back to JSON
      throw new Error(`DATABASE_ERROR: ${err.message || 'PostgreSQL write operation failed'}`);
    }
  }

  // 2. DEVELOPMENT / DEMO MODE (DATABASE_URL unset only)
  const existing = readFileStore();
  const next = [rating, ...existing.filter(r => r.id !== rating.id)];
  writeFileStore(next);

  return {
    rating,
    storage: 'server_file'
  };
}
