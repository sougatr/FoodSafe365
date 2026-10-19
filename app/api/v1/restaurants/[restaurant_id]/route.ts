import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantEntryAsync } from '../../../../../lib/unclaimed-restaurant-store';
import { POPULAR_RESTAURANTS } from '../../../../../lib/restaurantsData';
import { ok, fail } from '../../../../../lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { restaurant_id: string } }
) {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return fail('CONFIGURATION_ERROR', 'Production configuration error: DATABASE_URL is required.', 500);
    }

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
    return fail('DATABASE_ERROR', 'Failed to fetch restaurant status.', 500);
  }
}
