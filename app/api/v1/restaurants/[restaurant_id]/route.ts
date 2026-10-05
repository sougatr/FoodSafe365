import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantEntry } from '@/lib/unclaimed-restaurant-store';
import { POPULAR_RESTAURANTS } from '@/lib/restaurantsData';
import { ok, fail } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurant_id: string } }
) {
  try {
    const restaurantId = params.restaurant_id?.trim();
    if (!restaurantId) {
      return fail('VALIDATION_ERROR', 'Restaurant ID is required', 400);
    }

    // Check store entry
    const storeEntry = getRestaurantEntry(restaurantId);
    if (storeEntry) {
      return ok({
        restaurant: storeEntry,
        isUnclaimed: storeEntry.status === 'UNCLAIMED' || storeEntry.status === 'DISCOVERED'
      });
    }

    // Check catalog
    const catalogItem = POPULAR_RESTAURANTS.find(r => r.id === restaurantId);
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

    return fail('NOT_FOUND', `Restaurant with ID '${restaurantId}' not found`, 404);
  } catch (err: any) {
    return fail('INTERNAL_ERROR', err?.message || 'Failed to fetch restaurant status', 500);
  }
}
