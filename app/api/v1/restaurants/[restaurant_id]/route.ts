import { NextRequest, NextResponse } from 'next/server';
import {
  getRestaurantEntryAsync,
  ensureRestaurantDirectoryEntryAsync
} from '../../../../../lib/unclaimed-restaurant-store';
import { POPULAR_RESTAURANTS } from '../../../../../lib/restaurantsData';
import { ok, fail } from '../../../../../lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurant_id: string } }
) {
  try {
    const restaurantId = params.restaurant_id?.trim();
    if (!restaurantId) {
      return fail('VALIDATION_ERROR', 'Restaurant ID is required', 400);
    }

    // Check PostgreSQL-backed store entry
    const storeEntry = await getRestaurantEntryAsync(restaurantId);
    if (storeEntry) {
      return ok({
        restaurant: storeEntry,
        isUnclaimed: storeEntry.status === 'UNCLAIMED' || storeEntry.status === 'DISCOVERED' || storeEntry.status === 'INVITED'
      });
    }

    // Check catalog fallback from POPULAR_RESTAURANTS if not found in database store
    const catalogItem = POPULAR_RESTAURANTS.find(r => r.id.toLowerCase() === restaurantId.toLowerCase() || r.name.toLowerCase() === restaurantId.toLowerCase());
    if (catalogItem) {
      return ok({
        restaurant: {
          id: catalogItem.id,
          name: catalogItem.name,
          city: catalogItem.city,
          location: catalogItem.location,
          status: catalogItem.status || 'UNCLAIMED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        isUnclaimed: (catalogItem.status || 'UNCLAIMED') === 'UNCLAIMED'
      });
    }

    // If not in database or catalog yet, auto-ensure directory listing so any rated or custom restaurant is claimable
    const ensuredEntry = await ensureRestaurantDirectoryEntryAsync(restaurantId);
    return ok({
      restaurant: ensuredEntry,
      isUnclaimed: true
    });
  } catch (err: any) {
    console.error('[API restaurants GET] Error:', err);
    try {
      const fallback = await ensureRestaurantDirectoryEntryAsync(params.restaurant_id?.trim() || 'unknown');
      return ok({
        restaurant: fallback,
        isUnclaimed: true
      });
    } catch {
      return fail('DATABASE_ERROR', 'Failed to fetch restaurant status.', 500);
    }
  }
}
