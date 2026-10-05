import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { DinerSafetyRating } from './foodsafety28';

export type RestaurantStatus =
  | 'DISCOVERED'
  | 'UNCLAIMED'
  | 'INVITED'
  | 'CLAIMED'
  | 'ONBOARDED'
  | 'ACTIVE';

export type ContactType = 'EMAIL' | 'PHONE' | 'OTHER';

export type ContactSourceType =
  | 'RESTAURANT_PROVIDED'
  | 'OFFICIAL_WEBSITE'
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

export type OutboxNotificationType = 'CUSTOMER_FEEDBACK_INVITATION';
export type OutboxNotificationStatus = 'QUEUED' | 'SENT' | 'FAILED' | 'SUPPRESSED';

export interface MockOutboxNotification {
  id: string;
  restaurantId: string;
  restaurantName: string;
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
  city: string;
  location: string;
  status: RestaurantStatus;
  claimedAt?: string;
  claimedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// DEFAULT SEED DIRECTORY & CONTACT DATA
// ----------------------------------------------------
const SEED_RESTAURANTS: RestaurantDirectoryEntry[] = [
  {
    id: 'leopold-cafe',
    name: 'Leopold Cafe & Bar',
    city: 'Mumbai',
    location: 'Colaba Causeway, Mumbai',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'the-table',
    name: 'The Table',
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
    city: 'Kolkata',
    location: 'Park Street, Kolkata',
    status: 'UNCLAIMED',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'kyani-and-co',
    name: 'Kyani & Co.',
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
  const existing = map.get(restaurantId) || {
    id: restaurantId,
    name: restaurantId,
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

  const emailSubject = `Customer feedback received for ${rating.outletName}`;
  const emailBody = `Dear Management Team,

A customer recently submitted food-safety feedback for:

${rating.outletName}
Location: ${restaurant.location || restaurant.city}

Customer Food-Safety Rating:
${rating.overallScore.toFixed(1)} / 5

Feedback summary:

Table & Cutlery Hygiene: ${rating.scores.cleanliness}/5
Staff Hygiene: ${rating.scores.staffHygiene}/5
Food Freshness & Temperature: ${rating.scores.foodFreshness}/5
Safe Drinking Water & Washrooms: ${rating.scores.safeWater}/5
Overall Dining Cleanliness: ${rating.scores.washroom}/5

${observationSection}${customerResponseSection}
FoodSafe365 is a digital food-safety management platform that helps restaurants capture customer feedback and convert relevant signals into operational food-safety checks, corrective actions and records.

Your restaurant has not yet claimed its FoodSafe365 profile.

[CLAIM YOUR RESTAURANT PROFILE]:
${claimUrl}

You can review the feedback and, if you choose, use FoodSafe365 to manage your food-safety operations.

Regards,

FoodSafe365
Safer food. Every day.`;

  const notification: MockOutboxNotification = {
    id: `notif-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    restaurantId: rating.outletId,
    restaurantName: rating.outletName,
    feedbackId: rating.id,
    notificationType: 'CUSTOMER_FEEDBACK_INVITATION',
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
