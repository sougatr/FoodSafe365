import { NextResponse } from 'next/server';
import { saveGroceryOutlet, getGroceryOutlet } from '@/lib/grocery-store';
import { ok, fail } from '@/lib/response';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || '').trim();
    const branchName = String(body.branchName || '').trim();
    const city = String(body.city || 'Mumbai').trim();
    const address = String(body.address || '').trim();
    const managerName = String(body.managerName || '').trim();
    const contactNumber = String(body.contactNumber || '').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    const fssaiNumber = String(body.fssaiNumber || '').trim();
    const storeType = body.storeType || 'supermarket';
    const selectedCategories = Array.isArray(body.selectedCategories) ? body.selectedCategories : [];

    if (!name || !branchName) {
      return fail('VALIDATION_ERROR', 'Store name and outlet / branch name are required.', 400);
    }

    if (!contactNumber) {
      return fail('VALIDATION_ERROR', 'Contact phone number is required.', 400);
    }

    const id = body.id || `store-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${branchName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const saved = saveGroceryOutlet({
      id,
      name,
      branchName,
      address: address || `${branchName}, ${city}`,
      city,
      managerName: managerName || 'Store Manager',
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
