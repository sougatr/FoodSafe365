# Sprint 15 Focused Check Fix 2

## Fix
Focused temperature controls now always fall back to their dedicated one-item measurement card when an outlet-specific database rule is not available. This prevents the generic Daily Food Safety Check from appearing under Storage/Cooking/Cooling/Thawing/Reheating.

## Expected UX
Temperature Controls → Storage → Check Storage Now → Storage Check → Check 1 of 1 → temperature measurement → FoodSafe365 evaluation → corrective action if needed → verification → record.

Daily Checks remains a separate multi-item workflow.

## Test
1. npm install
2. npm run typecheck
3. npm run build
4. npm run dev
5. Open Temperature Controls → Storage → Check Storage Now.
6. Confirm the question is about storage temperature and progress says 1 of 1.
