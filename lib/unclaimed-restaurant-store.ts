import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { DinerSafetyRating } from './foodsafety28';
import { query, transaction } from './db';

export type FoodBusinessType =
  | 'RESTAURANT'
  | 'GROCERY'
  | 'SUPERMARKET'
  | 'CAFE'
  | 'BAKERY'
  | 'CLOUD_KITCHEN'
  | 'CATERER'
  | 'HOTEL'
  | 'FOOD_SERVICE'
  | 'OTHER';

export type RestaurantStatus =
  | 'DISCOVERED'
  | 'UNCLAIMED'
  | 'INVITED'
  | 'CLAIMED'
  | 'ONBOARDED'
  | 'ACTIVE';

export type ContactType = 'EMAIL' | 'PHONE' | 'OTHER';

export type ContactSourceType =
  | 'BUSINESS_PROVIDED'
  | 'OFFICIAL_WEBSITE'
  | 'PERMITTED_BUSINESS_DIRECTORY'
  | 'OTHER_LEGITIMATE_BUSINESS_SOURCE'
  | 'RESTAURANT_PROVIDED'
  | 'PUBLIC_BUSINESS_SOURCE'
  | 'OTHER';

export interface RestaurantBusinessContact {
  id: string;
  restaurantId: string;
  contactType: ContactType;
  contactValue: string;
  sourceType: ContactSourceType;
  sourceReference?: string;
  isBusinessContact: boolean;
  permittedForFeedbackNotification: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BusinessContact = RestaurantBusinessContact;

export type OutboxNotificationType =
  | 'CUSTOMER_FEEDBACK_PROFILE_INVITATION'
  | 'CUSTOMER_FEEDBACK_INVITATION';

export type OutboxNotificationStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'SUPPRESSED';

export interface MockOutboxNotification {
  id: string;
  restaurantId: string;
  restaurantName: string;
  businessType?: FoodBusinessType;
  feedbackId: string;
  notificationType: OutboxNotificationType;
  recipientEmail: string;
  recipientType: 'BUSINESS_CONTACT';
  contactSource: ContactSourceType;
  subject: string;
  body: string;
  claimToken: string;
  claimUrl: string;
  status: OutboxNotificationStatus;
  customerResponseRequested: boolean;
  customerContactShared?: string;
  createdAt: string;
  sentAt?: string;
  metadata?: Record<string, any>;
}

export interface ClaimTokenRecord {
  token: string;
  restaurantId: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string;
  claimedBy?: string;
}

export interface RestaurantDirectoryEntry {
  id: string;
  name: string;
  businessType: FoodBusinessType;
  city: string;
  location: string;
  status: RestaurantStatus;
  claimedAt?: string;
  claimedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export type FoodBusinessDirectoryEntry = RestaurantDirectoryEntry;

// ----------------------------------------------------
// DEFAULT SEED DIRECTORY & CONTACT DATA
// ----------------------------------------------------
const SEED_RESTAURANTS: RestaurantDirectoryEntry[] = [
  {
    id: 'leopold-cafe',
    name: 'Leopold Cafe & Bar',
    businessType: 'RESTAURANT',
    city: 'Mumbai',
    location: 'Colaba Causeway, Mumbai',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'freshmart-supermarket',
    name: 'FreshMart Supermarket',
    businessType: 'SUPERMARKET',
    city: 'Mumbai',
    location: 'Bandra West, Mumbai',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'abc-grocery',
    name: 'ABC Grocery',
    businessType: 'GROCERY',
    city: 'Mumbai',
    location: 'Andheri East, Mumbai',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'the-table',
    name: 'The Table',
    businessType: 'RESTAURANT',
    city: 'Mumbai',
    location: 'Colaba, Mumbai',
    status: 'ACTIVE',
    claimedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    claimedByUserId: 'mgr-table-1',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: 'the-bombay-canteen',
    name: 'The Bombay Canteen',
    businessType: 'RESTAURANT',
    city: 'Mumbai',
    location: 'Lower Parel, Mumbai',
    status: 'ACTIVE',
    claimedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    claimedByUserId: 'mgr-canteen-1',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 45).toISOString()
  },
  {
    id: 'bastian-mumbai',
    name: 'Bastian',
    businessType: 'RESTAURANT',
    city: 'Mumbai',
    location: 'Bandra West, Mumbai',
    status: 'ACTIVE',
    claimedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    claimedByUserId: 'mgr-bastian-1',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 40).toISOString()
  },
  {
    id: 'peter-cat',
    name: 'Peter Cat',
    businessType: 'RESTAURANT',
    city: 'Kolkata',
    location: 'Park Street, Kolkata',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'kyani-and-co',
    name: 'Kyani & Co.',
    businessType: 'CAFE',
    city: 'Mumbai',
    location: 'Marine Lines, Mumbai',
    status: 'DISCOVERED',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

const SEED_CONTACTS: RestaurantBusinessContact[] = [
  {
    id: 'contact-leopold-1',
    restaurantId: 'leopold-cafe',
    contactType: 'EMAIL',
    contactValue: 'management@leopoldcafe.example.com',
    sourceType: 'OFFICIAL_WEBSITE',
    sourceReference: 'https://leopoldcafe.example.com/contact-management',
    isBusinessContact: true,
    permittedForFeedbackNotification: true,
    verifiedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'contact-freshmart-1',
    restaurantId: 'freshmart-supermarket',
    contactType: 'EMAIL',
    contactValue: 'operations@freshmartmumbai.example.com',
    sourceType: 'OFFICIAL_WEBSITE',
    sourceReference: 'https://freshmartmumbai.example.com/store-support',
    isBusinessContact: true,
    permittedForFeedbackNotification: true,
    verifiedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString()
  },
  {
    id: 'contact-peter-cat-1',
    restaurantId: 'peter-cat',
    contactType: 'EMAIL',
    contactValue: 'info@petercatkolkata.example.com',
    sourceType: 'OFFICIAL_WEBSITE',
    sourceReference: 'https://petercatkolkata.example.com/contact',
    isBusinessContact: true,
    permittedForFeedbackNotification: true,
    verifiedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

// Global in-memory process caches
declare global {
  var __foodsafe_restaurants_cache: Map<string, RestaurantDirectoryEntry> | undefined;
  var __foodsafe_contacts_cache: Map<string, RestaurantBusinessContact[]> | undefined;
  var __foodsafe_outbox_cache: MockOutboxNotification[] | undefined;
  var __foodsafe_claim_tokens_cache: Map<string, ClaimTokenRecord> | undefined;
  var __foodsafe_last_notification_time: Map<string, number> | undefined;
}

function getRestaurantsMap(): Map<string, RestaurantDirectoryEntry> {
  if (!globalThis.__foodsafe_restaurants_cache) {
    globalThis.__foodsafe_restaurants_cache = new Map();
    for (const r of SEED_RESTAURANTS) {
      globalThis.__foodsafe_restaurants_cache.set(r.id, { ...r });
    }
  }
  return globalThis.__foodsafe_restaurants_cache;
}

function getContactsMap(): Map<string, RestaurantBusinessContact[]> {
  if (!globalThis.__foodsafe_contacts_cache) {
    globalThis.__foodsafe_contacts_cache = new Map();
    for (const c of SEED_CONTACTS) {
      const existing = globalThis.__foodsafe_contacts_cache.get(c.restaurantId) || [];
      existing.push({ ...c });
      globalThis.__foodsafe_contacts_cache.set(c.restaurantId, existing);
    }
  }
  return globalThis.__foodsafe_contacts_cache;
}

function getOutboxList(): MockOutboxNotification[] {
  if (!globalThis.__foodsafe_outbox_cache) {
    globalThis.__foodsafe_outbox_cache = [];
  }
  return globalThis.__foodsafe_outbox_cache;
}

function getClaimTokensMap(): Map<string, ClaimTokenRecord> {
  if (!globalThis.__foodsafe_claim_tokens_cache) {
    globalThis.__foodsafe_claim_tokens_cache = new Map();
  }
  return globalThis.__foodsafe_claim_tokens_cache;
}

function getLastNotificationTimeMap(): Map<string, number> {
  if (!globalThis.__foodsafe_last_notification_time) {
    globalThis.__foodsafe_last_notification_time = new Map();
  }
  return globalThis.__foodsafe_last_notification_time;
}

// ----------------------------------------------------
// PUBLIC ACCESSORS FOR RESTAURANT DIRECTORY & STATUS
// ----------------------------------------------------

export function getRestaurantEntry(restaurantId: string): RestaurantDirectoryEntry | null {
  const map = getRestaurantsMap();
  const entry = map.get(restaurantId);
  return entry ? { ...entry } : null;
}

export function getAllRestaurantEntries(): RestaurantDirectoryEntry[] {
  const map = getRestaurantsMap();
  return Array.from(map.values()).map(r => ({ ...r }));
}

export function updateRestaurantStatus(restaurantId: string, status: RestaurantStatus, claimedByUserId?: string): RestaurantDirectoryEntry {
  const map = getRestaurantsMap();
  const existing: RestaurantDirectoryEntry = map.get(restaurantId) || {
    id: restaurantId,
    name: restaurantId,
    businessType: 'RESTAURANT',
    city: 'Mumbai',
    location: 'Mumbai',
    status: 'DISCOVERED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const updated: RestaurantDirectoryEntry = {
    ...existing,
    status,
    claimedAt: status === 'CLAIMED' ? new Date().toISOString() : existing.claimedAt,
    claimedByUserId: claimedByUserId || existing.claimedByUserId,
    updatedAt: new Date().toISOString()
  };

  map.set(restaurantId, updated);
  return { ...updated };
}

// ----------------------------------------------------
// RESTAURANT BUSINESS CONTACT ACCESSORS & PROVENANCE
// ----------------------------------------------------

export function getRestaurantBusinessContacts(restaurantId: string): RestaurantBusinessContact[] {
  const contactsMap = getContactsMap();
  const list = contactsMap.get(restaurantId) || [];
  return list.map(c => ({ ...c }));
}

export function addRestaurantBusinessContact(contact: Omit<RestaurantBusinessContact, 'id' | 'createdAt' | 'updatedAt'>): RestaurantBusinessContact {
  const contactsMap = getContactsMap();
  const existing = contactsMap.get(contact.restaurantId) || [];

  const newContact: RestaurantBusinessContact = {
    ...contact,
    id: `contact-${contact.restaurantId}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  existing.push(newContact);
  contactsMap.set(contact.restaurantId, existing);
  return { ...newContact };
}

// ----------------------------------------------------
// CLAIM TOKEN GENERATION & VERIFICATION
// ----------------------------------------------------

export function generateClaimToken(restaurantId: string, expiresInHours = 72): ClaimTokenRecord {
  const tokensMap = getClaimTokensMap();
  const token = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const record: ClaimTokenRecord = {
    token,
    restaurantId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + expiresInHours * 3600000).toISOString(),
    used: false
  };

  tokensMap.set(token, record);
  return { ...record };
}

export function verifyClaimToken(token: string, restaurantId: string): { valid: boolean; reason?: string; record?: ClaimTokenRecord } {
  const tokensMap = getClaimTokensMap();
  const record = tokensMap.get(token);

  if (!record) {
    return { valid: false, reason: 'INVALID_TOKEN' };
  }
  if (record.restaurantId !== restaurantId) {
    return { valid: false, reason: 'TOKEN_RESTAURANT_MISMATCH' };
  }
  if (record.used) {
    return { valid: false, reason: 'TOKEN_ALREADY_USED' };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'TOKEN_EXPIRED' };
  }

  return { valid: true, record: { ...record } };
}

export function markClaimTokenUsed(token: string, claimedBy: string): boolean {
  const tokensMap = getClaimTokensMap();
  const record = tokensMap.get(token);
  if (!record || record.used) return false;

  record.used = true;
  record.usedAt = new Date().toISOString();
  record.claimedBy = claimedBy;
  tokensMap.set(token, record);
  return true;
}

// ----------------------------------------------------
// MOCK EMAIL OUTBOX NOTIFICATION ENGINE
// ----------------------------------------------------

export interface NotificationGenerationResult {
  generated: boolean;
  notification?: MockOutboxNotification;
  reason?: 'RESTAURANT_NOT_UNCLAIMED' | 'NO_LEGITIMATE_CONTACT' | 'CONTACT_NOT_PERMITTED' | 'DUPLICATE_FEEDBACK' | 'COOLDOWN_ACTIVE';
}

export const NOTIFICATION_COOLDOWN_MS = 60 * 1000; // 60 seconds default cooldown

export function processCustomerFeedbackForUnclaimedRestaurant(
  rating: DinerSafetyRating,
  options?: {
    bypassCooldown?: boolean;
    baseUrl?: string;
    customRecipientEmail?: string;
  }
): NotificationGenerationResult {
  const restaurant = getRestaurantEntry(rating.outletId);
  if (!restaurant || (restaurant.status !== 'UNCLAIMED' && restaurant.status !== 'DISCOVERED' && restaurant.status !== 'INVITED')) {
    return { generated: false, reason: 'RESTAURANT_NOT_UNCLAIMED' };
  }

  // 1. Check duplicate for same feedback_id
  const outbox = getOutboxList();
  const alreadyGeneratedForFeedback = outbox.some(n => n.feedbackId === rating.id);
  if (alreadyGeneratedForFeedback) {
    return { generated: false, reason: 'DUPLICATE_FEEDBACK' };
  }

  // 2. Fetch legitimate business contact
  const contacts = getRestaurantBusinessContacts(rating.outletId);
  const eligibleContact = contacts.find(c => c.isBusinessContact && c.permittedForFeedbackNotification && c.contactType === 'EMAIL');

  if (!eligibleContact && !options?.customRecipientEmail) {
    return { generated: false, reason: 'NO_LEGITIMATE_CONTACT' };
  }

  const recipientEmail = options?.customRecipientEmail || eligibleContact!.contactValue;
  const contactSource = eligibleContact?.sourceType || 'OFFICIAL_WEBSITE';

  // 3. Cooldown check
  const lastTimeMap = getLastNotificationTimeMap();
  const cooldownKey = `${rating.outletId}::${recipientEmail}`;
  const now = Date.now();
  const lastSent = lastTimeMap.get(cooldownKey) || 0;

  if (!options?.bypassCooldown && (now - lastSent < NOTIFICATION_COOLDOWN_MS)) {
    return { generated: false, reason: 'COOLDOWN_ACTIVE' };
  }

  // 4. Generate secure non-guessable claim token
  const claimRecord = generateClaimToken(rating.outletId);
  const origin = options?.baseUrl || 'http://localhost:3000';
  const claimUrl = `${origin}/claim/${encodeURIComponent(rating.outletId)}?token=${claimRecord.token}`;

  // 5. Construct compliant, non-marketing email body
  // Non-negotiable product rule: DO NOT call this an audit, compliance report, or official score.
  // Privacy rule: ZERO customer PII unless explicitly requested.
  const customerResponseSection = (rating as any).responseRequested && (rating as any).consentToShareContact && ((rating as any).customerEmail || (rating as any).customerPhone)
    ? `\nCustomer has requested a response from management:\nContact: ${(rating as any).customerEmail || (rating as any).customerPhone}\n`
    : '';

  const observationSection = rating.feedback
    ? `Customer observation:\n"${rating.feedback}"\n`
    : 'No additional written observations provided.\n';

  const isGrocery = restaurant.businessType === 'GROCERY' || restaurant.businessType === 'SUPERMARKET';
  const categorySummary = isGrocery
    ? `Store & Surface Hygiene: ${rating.scores.cleanliness}/5
Staff Hygiene: ${rating.scores.staffHygiene}/5
Product Freshness & Temperature Control: ${rating.scores.foodFreshness}/5
Water / Hygiene Facilities: ${rating.scores.safeWater}/5
Overall Food-Safety Confidence: ${rating.scores.washroom}/5`
    : `Table & Cutlery Hygiene: ${rating.scores.cleanliness}/5
Staff Hygiene: ${rating.scores.staffHygiene}/5
Food Freshness & Temperature: ${rating.scores.foodFreshness}/5
Safe Drinking Water & Washrooms: ${rating.scores.safeWater}/5
Overall Dining Cleanliness: ${rating.scores.washroom}/5`;

  const emailSubject = `Customer feedback received for ${rating.outletName}`;
  const emailBody = `Dear Management Team,

A customer recently submitted food-safety feedback for:

${rating.outletName}
${restaurant.businessType}
${restaurant.location || restaurant.city}

Customer Food-Safety Rating:

${rating.overallScore.toFixed(1)} / 5

Feedback summary:

${categorySummary}

${observationSection}${customerResponseSection}
FoodSafe365 is a digital food-safety platform that helps food businesses capture customer feedback and convert relevant signals into operational checks, corrective actions and food-safety records.

Your business has not yet claimed its FoodSafe365 profile.

[CLAIM YOUR FOODSAFE365 PROFILE]:
${claimUrl}

You can claim the profile to review and manage customer feedback and explore FoodSafe365 food-safety management tools.

Regards,

FoodSafe365
Safer food. Every day.`;

  const notification: MockOutboxNotification = {
    id: `notif-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    restaurantId: rating.outletId,
    restaurantName: rating.outletName,
    businessType: restaurant.businessType,
    feedbackId: rating.id,
    notificationType: 'CUSTOMER_FEEDBACK_PROFILE_INVITATION',
    recipientEmail,
    recipientType: 'BUSINESS_CONTACT',
    contactSource,
    subject: emailSubject,
    body: emailBody,
    claimToken: claimRecord.token,
    claimUrl,
    status: 'SENT', // In mock environment, "SENT" means placed in outbox
    customerResponseRequested: Boolean((rating as any).responseRequested),
    customerContactShared: (rating as any).responseRequested && (rating as any).consentToShareContact
      ? ((rating as any).customerEmail || (rating as any).customerPhone)
      : undefined,
    createdAt: new Date(now).toISOString(),
    sentAt: new Date(now).toISOString()
  };

  outbox.push(notification);
  lastTimeMap.set(cooldownKey, now);

  // Transition status from DISCOVERED / UNCLAIMED to INVITED
  updateRestaurantStatus(rating.outletId, 'INVITED');

  return {
    generated: true,
    notification: { ...notification }
  };
}

export function getMockOutboxNotifications(restaurantId?: string): MockOutboxNotification[] {
  const outbox = getOutboxList();
  if (restaurantId && restaurantId !== 'all') {
    return outbox.filter(n => n.restaurantId === restaurantId).map(n => ({ ...n }));
  }
  return outbox.map(n => ({ ...n }));
}

export function clearMockOutbox(): void {
  globalThis.__foodsafe_outbox_cache = [];
  globalThis.__foodsafe_last_notification_time = new Map();
}

// ----------------------------------------------------
// ASYNC POSTGRESQL-BACKED OPERATIONS (F-11)
// ----------------------------------------------------

export async function getRestaurantEntryAsync(restaurantId: string): Promise<RestaurantDirectoryEntry | null> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        SELECT id, name, business_type "businessType", city, location, status,
               claimed_at "claimedAt", claimed_by_user_id "claimedByUserId",
               created_at "createdAt", updated_at "updatedAt"
        FROM unclaimed_directory_entries
        WHERE id = $1
      `, [restaurantId]);
      if (rows[0]) return rows[0];

      // Check registered outlets
      const outletRows = await query<any>(`
        SELECT id, name, city, status, created_at "createdAt", updated_at "updatedAt"
        FROM outlets
        WHERE id::text = $1
      `, [restaurantId]);
      if (outletRows[0]) {
        return {
          id: outletRows[0].id,
          name: outletRows[0].name,
          businessType: 'RESTAURANT',
          city: outletRows[0].city || 'Mumbai',
          location: outletRows[0].city || 'Mumbai',
          status: 'ACTIVE',
          claimedAt: outletRows[0].createdAt,
          claimedByUserId: undefined,
          createdAt: outletRows[0].createdAt,
          updatedAt: outletRows[0].updatedAt
        };
      }
      return null;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return getRestaurantEntry(restaurantId);
    }
  }
  return getRestaurantEntry(restaurantId);
}

export async function getAllRestaurantEntriesAsync(): Promise<RestaurantDirectoryEntry[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        SELECT id, name, business_type "businessType", city, location, status,
               claimed_at "claimedAt", claimed_by_user_id "claimedByUserId",
               created_at "createdAt", updated_at "updatedAt"
        FROM unclaimed_directory_entries
        ORDER BY name ASC
      `);
      return rows;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return getAllRestaurantEntries();
    }
  }
  return getAllRestaurantEntries();
}

export async function updateRestaurantStatusAsync(
  restaurantId: string,
  status: RestaurantStatus,
  claimedByUserId?: string
): Promise<RestaurantDirectoryEntry> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        INSERT INTO unclaimed_directory_entries(id, name, business_type, city, location, status, claimed_at, claimed_by_user_id, created_at, updated_at)
        VALUES($1, $1, 'RESTAURANT', 'Mumbai', 'Mumbai', $2, CASE WHEN $2 = 'CLAIMED' THEN now() ELSE NULL END, $3, now(), now())
        ON CONFLICT (id) DO UPDATE
        SET status = EXCLUDED.status,
            claimed_at = CASE WHEN EXCLUDED.status = 'CLAIMED' THEN now() ELSE unclaimed_directory_entries.claimed_at END,
            claimed_by_user_id = COALESCE(EXCLUDED.claimed_by_user_id, unclaimed_directory_entries.claimed_by_user_id),
            updated_at = now()
        RETURNING id, name, business_type "businessType", city, location, status,
                  claimed_at "claimedAt", claimed_by_user_id "claimedByUserId",
                  created_at "createdAt", updated_at "updatedAt"
      `, [restaurantId, status, claimedByUserId || null]);
      updateRestaurantStatus(restaurantId, status, claimedByUserId);
      return rows[0];
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return updateRestaurantStatus(restaurantId, status, claimedByUserId);
    }
  }
  return updateRestaurantStatus(restaurantId, status, claimedByUserId);
}

export async function getRestaurantBusinessContactsAsync(restaurantId: string): Promise<RestaurantBusinessContact[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        SELECT id, restaurant_id "restaurantId", contact_type "contactType",
               contact_value "contactValue", source_type "sourceType",
               source_reference "sourceReference", is_business_contact "isBusinessContact",
               permitted_for_feedback_notification "permittedForFeedbackNotification",
               verified_at "verifiedAt", created_at "createdAt", updated_at "updatedAt"
        FROM unclaimed_business_contacts
        WHERE restaurant_id = $1
      `, [restaurantId]);
      return rows;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return getRestaurantBusinessContacts(restaurantId);
    }
  }
  return getRestaurantBusinessContacts(restaurantId);
}

export async function generateClaimTokenAsync(restaurantId: string, expiresInHours = 72): Promise<ClaimTokenRecord> {
  const token = crypto.randomBytes(24).toString('hex');
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        INSERT INTO claim_tokens(token, restaurant_id, created_at, expires_at, used)
        VALUES($1, $2, now(), now() + ($3 || ' hours')::interval, false)
        RETURNING token, restaurant_id "restaurantId", created_at "createdAt", expires_at "expiresAt", used
      `, [token, restaurantId, expiresInHours]);
      const rec = rows[0];
      getClaimTokensMap().set(token, rec);
      return rec;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return generateClaimToken(restaurantId, expiresInHours);
    }
  }
  return generateClaimToken(restaurantId, expiresInHours);
}

export async function verifyClaimTokenAsync(
  token: string,
  restaurantId: string
): Promise<{ valid: boolean; reason?: string; record?: ClaimTokenRecord }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'INVALID_TOKEN' };
  }
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        SELECT token, restaurant_id "restaurantId", created_at "createdAt",
               expires_at "expiresAt", used, used_at "usedAt", claimed_by "claimedBy"
        FROM claim_tokens
        WHERE token = $1
      `, [token]);
      if (!rows[0]) return { valid: false, reason: 'INVALID_TOKEN' };
      const record = rows[0];
      if (record.restaurantId !== restaurantId) return { valid: false, reason: 'TOKEN_RESTAURANT_MISMATCH' };
      if (record.used) return { valid: false, reason: 'TOKEN_ALREADY_USED' };
      if (new Date(record.expiresAt).getTime() < Date.now()) return { valid: false, reason: 'TOKEN_EXPIRED' };
      return { valid: true, record };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return verifyClaimToken(token, restaurantId);
    }
  }
  return verifyClaimToken(token, restaurantId);
}

export async function markClaimTokenUsedAsync(token: string, claimedBy: string): Promise<boolean> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        UPDATE claim_tokens
        SET used = true, used_at = now(), claimed_by = $2
        WHERE token = $1 AND used = false
        RETURNING token
      `, [token, claimedBy]);
      markClaimTokenUsed(token, claimedBy);
      return rows.length > 0;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return markClaimTokenUsed(token, claimedBy);
    }
  }
  return markClaimTokenUsed(token, claimedBy);
}

export async function processCustomerFeedbackForUnclaimedRestaurantAsync(
  rating: DinerSafetyRating,
  options?: {
    bypassCooldown?: boolean;
    baseUrl?: string;
    customRecipientEmail?: string;
  }
): Promise<NotificationGenerationResult> {
  const restaurant = await getRestaurantEntryAsync(rating.outletId);
  if (!restaurant || (restaurant.status !== 'UNCLAIMED' && restaurant.status !== 'DISCOVERED' && restaurant.status !== 'INVITED')) {
    return { generated: false, reason: 'RESTAURANT_NOT_UNCLAIMED' };
  }

  if (process.env.DATABASE_URL) {
    try {
      // 1. Check duplicate for same feedbackId
      const dupRows = await query<any>(`
        SELECT id FROM outbox_notifications WHERE feedback_id = $1 LIMIT 1
      `, [rating.id]);
      if (dupRows.length > 0) {
        return { generated: false, reason: 'DUPLICATE_FEEDBACK' };
      }

      // 2. Fetch business contacts
      const contacts = await getRestaurantBusinessContactsAsync(rating.outletId);
      const eligibleContact = contacts.find(c => c.isBusinessContact && c.permittedForFeedbackNotification && c.contactType === 'EMAIL');
      if (!eligibleContact && !options?.customRecipientEmail) {
        return { generated: false, reason: 'NO_LEGITIMATE_CONTACT' };
      }

      const recipientEmail = options?.customRecipientEmail || eligibleContact!.contactValue;
      const contactSource = eligibleContact?.sourceType || 'OFFICIAL_WEBSITE';

      // 3. Cooldown check (60s)
      if (!options?.bypassCooldown) {
        const cooldownRows = await query<any>(`
          SELECT id FROM outbox_notifications
          WHERE restaurant_id = $1 AND recipient_email = $2 AND created_at > now() - interval '60 seconds'
          LIMIT 1
        `, [rating.outletId, recipientEmail]);
        if (cooldownRows.length > 0) {
          return { generated: false, reason: 'COOLDOWN_ACTIVE' };
        }
      }

      // 4. Generate claim token
      const claimRecord = await generateClaimTokenAsync(rating.outletId);
      const origin = options?.baseUrl || 'http://localhost:3000';
      const claimUrl = `${origin}/claim/${encodeURIComponent(rating.outletId)}?token=${claimRecord.token}`;

      const emailSubject = `Customer feedback received for ${rating.outletName}`;
      const emailBody = `A customer recently submitted food-safety feedback for ${rating.outletName}.\nClaim your profile:\n${claimUrl}`;

      const now = new Date().toISOString();
      const notifId = `notif-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      await query(`
        INSERT INTO outbox_notifications(
          id, restaurant_id, restaurant_name, business_type, feedback_id,
          notification_type, recipient_email, recipient_type, contact_source,
          subject, body, claim_token, claim_url, status,
          customer_response_requested, customer_contact_shared, created_at, sent_at
        )
        VALUES($1, $2, $3, $4, $5, 'CUSTOMER_FEEDBACK_PROFILE_INVITATION', $6, 'BUSINESS_CONTACT', $7, $8, $9, $10, $11, 'SENT', $12, $13, now(), now())
      `, [
        notifId, rating.outletId, rating.outletName, restaurant.businessType,
        rating.id, recipientEmail, contactSource, emailSubject, emailBody,
        claimRecord.token, claimUrl, Boolean((rating as any).responseRequested),
        (rating as any).customerEmail || (rating as any).customerPhone || null
      ]);

      await updateRestaurantStatusAsync(rating.outletId, 'INVITED');

      const notification: MockOutboxNotification = {
        id: notifId,
        restaurantId: rating.outletId,
        restaurantName: rating.outletName,
        businessType: restaurant.businessType,
        feedbackId: rating.id,
        notificationType: 'CUSTOMER_FEEDBACK_PROFILE_INVITATION',
        recipientEmail,
        recipientType: 'BUSINESS_CONTACT',
        contactSource,
        subject: emailSubject,
        body: emailBody,
        claimToken: claimRecord.token,
        claimUrl,
        status: 'SENT',
        customerResponseRequested: Boolean((rating as any).responseRequested),
        customerContactShared: (rating as any).customerEmail || (rating as any).customerPhone,
        createdAt: now,
        sentAt: now
      };

      getOutboxList().push(notification);

      return {
        generated: true,
        notification
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return processCustomerFeedbackForUnclaimedRestaurant(rating, options);
    }
  }

  return processCustomerFeedbackForUnclaimedRestaurant(rating, options);
}

export async function getOutboxNotificationsAsync(restaurantId?: string): Promise<MockOutboxNotification[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await query<any>(`
        SELECT id, restaurant_id "restaurantId", restaurant_name "restaurantName",
               business_type "businessType", feedback_id "feedbackId",
               notification_type "notificationType", recipient_email "recipientEmail",
               recipient_type "recipientType", contact_source "contactSource",
               subject, body, claim_token "claimToken", claim_url "claimUrl",
               status, customer_response_requested "customerResponseRequested",
               customer_contact_shared "customerContactShared",
               created_at "createdAt", sent_at "sentAt"
        FROM outbox_notifications
        ${restaurantId && restaurantId !== 'all' ? 'WHERE restaurant_id = $1' : ''}
        ORDER BY created_at DESC
      `, restaurantId && restaurantId !== 'all' ? [restaurantId] : []);
      return rows;
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
      return getMockOutboxNotifications(restaurantId);
    }
  }
  return getMockOutboxNotifications(restaurantId);
}

export async function clearOutboxAsync(): Promise<void> {
  clearMockOutbox();
  if (process.env.DATABASE_URL) {
    try {
      await query(`DELETE FROM outbox_notifications`);
    } catch (err) {
      if (process.env.NODE_ENV === 'production') throw err;
    }
  }
}

// Aliases for generalized food business domain terminology
export const getFoodBusinessEntry = getRestaurantEntry;
export const getAllFoodBusinessEntries = getAllRestaurantEntries;
export const updateFoodBusinessStatus = updateRestaurantStatus;
export const getFoodBusinessContacts = getRestaurantBusinessContacts;
export const addFoodBusinessContact = addRestaurantBusinessContact;
export const processCustomerFeedbackForUnclaimedFoodBusiness = processCustomerFeedbackForUnclaimedRestaurant;

export const getFoodBusinessEntryAsync = getRestaurantEntryAsync;
export const getAllFoodBusinessEntriesAsync = getAllRestaurantEntriesAsync;
export const updateFoodBusinessStatusAsync = updateRestaurantStatusAsync;
export const getFoodBusinessContactsAsync = getRestaurantBusinessContactsAsync;
export const processCustomerFeedbackForUnclaimedFoodBusinessAsync = processCustomerFeedbackForUnclaimedRestaurantAsync;


