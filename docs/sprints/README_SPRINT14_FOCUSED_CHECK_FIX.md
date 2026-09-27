# Sprint 14 Focused Check Fix

## Fix
The focused temperature-control journey now works in demo mode as a true focused check.

Previously, `/checks?focus=Storage` loaded the generic demo check because the demo API did not contain seeded FSSAI rule codes. The UI therefore showed the unrelated cleaning question and `Check 1 of 3`.

## Correct behaviour
`Temperature Controls → Storage → Check Storage Now` now loads exactly one Storage measurement item:

- `Storage Check`
- `Check 1 of 1`
- `Record temperature (°C)`
- chilled-storage demo reference: ≤5°C

The same focused pattern is prepared for Cooking, Cooling, Thawing and Reheating.

Production/database mode continues to select the real rule by rule code; this change only supplies deterministic focused demo items when the database is not configured.
