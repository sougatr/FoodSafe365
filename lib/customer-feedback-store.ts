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
    dinerName: 'Priya Mehta',
    dinerMobile: '+91 98201 12345',
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
    dinerMobile: '+91 98110 54321',
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
    id: 'seed-rating-table-3',
    outletId: 'the-table',
    outletName: 'The Table (Colaba)',
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    dinerName: 'Ananya S.',
    dinerMobile: '+91 99800 76543',
    tableNumber: 'Table 02',
    scores: {
      cleanliness: 5,
      staffHygiene: 4,
      foodFreshness: 4,
      safeWater: 4,
      washroom: 5
    },
    overallScore: 4.4,
    feedback: 'Very hygienic open kitchen setup. Water bottle was sealed and verified.',
    verifiedDineIn: true
  },
  {
    id: 'seed-rating-bastian-1',
    outletId: 'bastian-mumbai',
    outletName: 'Bastian (Bandra West)',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    dinerName: 'Vikram Seth',
    dinerMobile: '+91 98200 99881',
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
    id: 'seed-rating-canteen-1',
    outletId: 'the-bombay-canteen',
    outletName: 'The Bombay Canteen',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dinerName: 'Sameer J.',
    dinerMobile: '+91 98330 11223',
    tableNumber: 'Table 14',
    scores: {
      cleanliness: 5,
      staffHygiene: 5,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 4
    },
    overallScore: 4.8,
    feedback: 'Top-notch hygiene standards throughout the bar and open kitchen.',
    verifiedDineIn: true
  }
];

// Helper to determine persistent storage file path
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

// Read from persistent server file
function readFileStore(): DinerSafetyRating[] {
  const filePath = getFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Seed initial data if file does not exist or is empty
    writeFileStore(DEFAULT_SEED_RATINGS);
    return DEFAULT_SEED_RATINGS;
  } catch (err) {
    console.warn('[customer-feedback-store] Error reading file store:', err);
    return DEFAULT_SEED_RATINGS;
  }
}

// Write to persistent server file atomically
function writeFileStore(ratings: DinerSafetyRating[]): void {
  const filePath = getFilePath();
  try {
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(ratings, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.warn('[customer-feedback-store] Error writing file store:', err);
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
    console.warn('[customer-feedback-store] PostgreSQL initialization failed:', err);
    return false;
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
 * Supports PostgreSQL when DATABASE_URL is set, with seamless fallback to persistent server file store.
 */
export async function getCustomerFeedback(outletId?: string): Promise<FeedbackStorageResult> {
  const targetOutlet = outletId && outletId !== 'all' ? outletId.trim() : null;

  // 1. Attempt PostgreSQL query if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    try {
      const ready = await ensurePgTable();
      if (ready) {
        let querySql = `SELECT * FROM customer_feedback`;
        const params: any[] = [];
        if (targetOutlet) {
          querySql += ` WHERE outlet_id = $1`;
          params.push(targetOutlet);
        }
        querySql += ` ORDER BY created_at DESC`;

        const rows = await query<any>(querySql, params);
        if (rows.length > 0) {
          const ratings = rows.map(mapPgRowToRating);
          return { ratings, storage: 'postgresql', count: ratings.length };
        }
      }
    } catch (err) {
      console.warn('[customer-feedback-store] Postgres query fallback triggered:', err);
    }
  }

  // 2. Persistent Server File Store (for cross-device access without PostgreSQL or during local dev)
  const allRatings = readFileStore();
  const filtered = targetOutlet
    ? allRatings.filter(r => r.outletId === targetOutlet)
    : allRatings;

  // Sort descending by creation date
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    ratings: filtered,
    storage: 'server_file',
    count: filtered.length
  };
}

/**
 * Save a new Customer Food-Safety Rating.
 * Persists to PostgreSQL if configured, and saves to persistent server file store for guaranteed cross-device availability.
 */
export async function saveCustomerFeedback(rating: DinerSafetyRating): Promise<{ rating: DinerSafetyRating; storage: 'postgresql' | 'server_file' }> {
  let storedWithPg = false;

  // 1. Save to PostgreSQL if configured
  if (process.env.DATABASE_URL) {
    try {
      const ready = await ensurePgTable();
      if (ready) {
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
        storedWithPg = true;
      }
    } catch (err) {
      console.warn('[customer-feedback-store] PostgreSQL insert failed, falling back to file store:', err);
    }
  }

  // 2. Also persist to persistent server file store (ensuring cross-device sync even across dev restarts)
  const existing = readFileStore();
  const next = [rating, ...existing.filter(r => r.id !== rating.id)];
  writeFileStore(next);

  return {
    rating,
    storage: storedWithPg ? 'postgresql' : 'server_file'
  };
}
