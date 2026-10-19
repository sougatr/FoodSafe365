import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { isDatabaseConfigured, query } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function performReset() {
  const clearedFiles: string[] = [];

  // 1. Clear .data directory files
  try {
    const dataDir = path.join(process.cwd(), '.data');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(dataDir, file));
          clearedFiles.push(`.data/${file}`);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.warn('[reset-all-data] Error cleaning .data dir:', err);
  }

  // 2. Clear /tmp foodsafe files
  try {
    const tmpDir = os.tmpdir();
    const tmpFiles = [
      'foodsafe365_service_providers.json',
      'foodsafe365_service_requests.json',
      'foodsafe365_customer_feedback.json',
      'contact_outbox.json'
    ];
    for (const f of tmpFiles) {
      const fullPath = path.join(tmpDir, f);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          clearedFiles.push(`tmp/${f}`);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.warn('[reset-all-data] Error cleaning tmp files:', err);
  }

  // 3. Clear In-Memory Globals
  try {
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__foodsafe_contact_outbox = [];
      (globalThis as any).__foodsafe_feedback_store = undefined;
    }
  } catch {
    // ignore
  }

  // 4. Clear Database records if DB is configured
  let dbCleared = false;
  try {
    if (isDatabaseConfigured()) {
      await query(`DELETE FROM service_requests`);
      await query(`
        DELETE FROM service_providers 
        WHERE id NOT IN (
          'prov-pest-apex', 
          'prov-refrig-frost', 
          'prov-clean-ecoclean', 
          'prov-water-aquapure', 
          'prov-pune-pest', 
          'prov-kolkata-refrig'
        )
      `);
      await query(`DELETE FROM customer_feedback WHERE id NOT LIKE 'seed-%'`);
      dbCleared = true;
    }
  } catch (dbErr) {
    console.warn('[reset-all-data] Database reset skipped/warning:', dbErr);
  }

  return { clearedFiles, dbCleared };
}

export async function POST() {
  const result = await performReset();

  const response = NextResponse.json({
    success: true,
    message: 'All test onboarding records, uploaded details, and sessions have been reset.',
    details: result
  });

  // Clear all session cookies
  const cookiesToClear = [
    SESSION_COOKIE_NAME,
    'fs_user_id',
    'fs_org_id',
    'fs_outlet_id',
    'fs_role',
    'fs_provider_id'
  ];

  for (const c of cookiesToClear) {
    response.cookies.set(c, '', { httpOnly: true, maxAge: 0, path: '/' });
  }

  return response;
}

export async function GET() {
  return POST();
}
