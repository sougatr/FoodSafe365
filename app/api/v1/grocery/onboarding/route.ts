import { NextResponse } from 'next/server';
import { saveGroceryOutlet, getGroceryOutlet } from '@/lib/grocery-store';
import { ok, fail } from '@/lib/response';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || '').trim();
    const city = String(body.city || 'Mumbai').trim();
    const branchName = String(body.branchName || `${city} Store`).trim();
    const address = String(body.address || '').trim() || `${name}, ${city}`;
    const dailyCheckPerson = String(body.dailyCheckPerson || '').trim();
    const managerName = String(body.managerName || dailyCheckPerson || 'Store Manager').trim();
    const contactNumber = String(body.contactNumber || 'Not provided').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    const fssaiNumber = String(body.fssaiNumber || '').trim();
    const storeType = body.storeType || 'supermarket';
    const selectedCategories = Array.isArray(body.selectedCategories) ? body.selectedCategories : [];

    if (!name) {
      return fail('VALIDATION_ERROR', 'Store name is required.', 400);
    }

    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const cleanBranch = (branchName || city).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = body.id || `store-${cleanName}-${cleanBranch}`;

    const saved = saveGroceryOutlet({
      id,
      name,
      branchName,
      address,
      city,
      managerName,
      dailyCheckPerson: dailyCheckPerson || managerName,
      contactNumber,
      contactEmail: contactEmail || `manager@${id}.example.com`,
      fssaiNumber: fssaiNumber || '10000000000000',
      storeType,
      selectedCategories
    });

    const response = NextResponse.json({
      success: true,
      data: saved
    });

    // Set tenant session cookies for the store manager
    response.cookies.set('fs_outlet_id', saved.id, { path: '/', httpOnly: false });
    response.cookies.set('fs_role', 'outlet_manager', { path: '/', httpOnly: false });
    response.cookies.set('fs_user_id', `mgr-${saved.id}`, { path: '/', httpOnly: false });

    return response;
  } catch (err: any) {
    return fail('SERVER_ERROR', err.message || 'Failed to onboard grocery store', 500);
  }
}
