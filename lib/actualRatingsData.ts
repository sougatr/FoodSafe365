import { DinerSafetyRating } from './foodsafety28';

export const INITIAL_ACTUAL_RATINGS: DinerSafetyRating[] = [
  // 1. The Table, Mumbai (Three ratings: 4, 5, 5 -> Avg 4.7)
  {
    id: 'rating-the-table-1',
    outletId: 'the-table',
    outletName: 'The Table (Colaba, Mumbai)',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dinerName: 'Priya M.',
    dinerMobile: '+91 98201 ****5',
    tableNumber: 'Table 04',
    scores: {
      cleanliness: 4,
      staffHygiene: 4,
      foodFreshness: 4,
      safeWater: 4,
      washroom: 4
    },
    overallScore: 4.0,
    feedback: 'Good dining experience and clean cutlery.',
    verifiedDineIn: true
  },
  {
    id: 'rating-the-table-2',
    outletId: 'the-table',
    outletName: 'The Table (Colaba, Mumbai)',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    dinerName: 'Rahul S.',
    dinerMobile: '+91 98110 ****1',
    tableNumber: 'Table 08',
    scores: {
      cleanliness: 5,
      staffHygiene: 5,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 5
    },
    overallScore: 5.0,
    feedback: 'Spotless kitchen, fresh ingredients and excellent hygiene protocols.',
    verifiedDineIn: true
  },
  {
    id: 'rating-the-table-3',
    outletId: 'the-table',
    outletName: 'The Table (Colaba, Mumbai)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    dinerName: 'Anita K.',
    dinerMobile: '+91 98330 ****2',
    tableNumber: 'Table 12',
    scores: {
      cleanliness: 5,
      staffHygiene: 5,
      foodFreshness: 5,
      safeWater: 5,
      washroom: 5
    },
    overallScore: 5.0,
    feedback: 'Clean tables, purified water, and kitchen staff strictly wearing hairnets.',
    verifiedDineIn: true
  },

  // 2. The Central Bistro, Mumbai (Rating: 4.0)
  {
    id: 'rating-central-bistro-1',
    outletId: 'the-central-bistro-mumbai',
    outletName: 'The Central Bistro, Mumbai',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    dinerName: 'Sameer V.',
    dinerMobile: '+91 98200 ****4',
    tableNumber: 'Table 03',
    scores: {
      cleanliness: 4,
      staffHygiene: 4,
      foodFreshness: 4,
      safeWater: 4,
      washroom: 4
    },
    overallScore: 4.0,
    feedback: 'Clean ambiance, well-maintained dining space and hygienic food service.',
    verifiedDineIn: true
  },

  // 3. Coffee Island, Mumbai (Rating: 4.0)
  {
    id: 'rating-coffee-island-1',
    outletId: 'coffee-island-mumbai',
    outletName: 'Coffee Island, Mumbai',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dinerName: 'Meera D.',
    dinerMobile: '+91 98190 ****8',
    tableNumber: 'Table 02',
    scores: {
      cleanliness: 4,
      staffHygiene: 4,
      foodFreshness: 4,
      safeWater: 4,
      washroom: 4
    },
    overallScore: 4.0,
    feedback: 'Clean coffee bar counter and hygienic milk refrigeration.',
    verifiedDineIn: true
  },

  // 4. BadeMiya, Mumbai (Rating: 3.0)
  {
    id: 'rating-bademiya-1',
    outletId: 'bademiya-mumbai',
    outletName: 'BadeMiya, Mumbai',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    dinerName: 'Aditya P.',
    dinerMobile: '+91 98210 ****3',
    tableNumber: 'Table 09',
    scores: {
      cleanliness: 3,
      staffHygiene: 3,
      foodFreshness: 3,
      safeWater: 3,
      washroom: 3
    },
    overallScore: 3.0,
    feedback: 'Tasty food, but outdoor table cleaning and staff grooming need attention.',
    verifiedDineIn: true
  },

  // 5. The Spice Kitchen, Mumbai (Rating: 2.0, comment: undercooked food)
  {
    id: 'rating-spice-kitchen-1',
    outletId: 'the-spice-kitchen-mumbai',
    outletName: 'The Spice Kitchen, Mumbai',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    dinerName: 'Kunal R.',
    dinerMobile: '+91 98205 ****9',
    tableNumber: 'Table 05',
    scores: {
      cleanliness: 2,
      staffHygiene: 2,
      foodFreshness: 2,
      safeWater: 2,
      washroom: 2
    },
    overallScore: 2.0,
    feedback: 'undercooked food',
    verifiedDineIn: true
  }
];

export const RATINGS_STORAGE_VERSION_KEY = 'foodsafe365_ratings_seed_version';
export const CURRENT_RATINGS_VERSION = 'v3_actual';
