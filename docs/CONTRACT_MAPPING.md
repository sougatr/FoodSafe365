# FoodSafe365 Contract Mapping

The application is aligned to three approved sources:

1. `contracts/ERD.xlsx` — database structure and relationships.
2. `contracts/Rules_Matrix.xlsx` — food-safety rules, applicability, risk, actions, verification and service triggers.
3. `contracts/openapi.yaml` — API contract.

## Runtime mapping

| Product layer | Implementation |
|---|---|
| UI | `app/*` |
| API | `app/api/v1/*` |
| API client | `lib/api.ts` |
| PostgreSQL | `lib/db.ts` + `db/schema.sql` |
| ERD seed | `db/seed.sql` |
| Rule source snapshot | `db/rules_master.json` |
| API contract | `contracts/openapi.yaml` |

## Golden-path boundary

`Onboarding → Organisation/Outlet → Processes/Equipment → Applicable Rules → Check Plan → Today's Checks → Response → Observation → Corrective Action → Evidence → Verification → Dashboard`

The server remains the enforcement boundary for tenant ownership, permissions, rule applicability, risk and workflow state.
