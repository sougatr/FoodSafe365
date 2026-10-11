import { redirect } from 'next/navigation';

/**
 * FoSTaC Learning Hub Route Redirection
 * Canonical learning hub destination is /food-safety-why.
 * This redirect ensures a single authoritative learning hub across both
 * the main website navigation and Grocery Store operations.
 */
export default function GroceryLearnRedirect() {
  redirect('/food-safety-why');
}
