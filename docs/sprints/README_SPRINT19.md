# FoodSafe365 — Sprint 19: Food Safety Intelligence

## Baseline
Sprint 19 builds directly on Sprint 18. It does not replace the guided operational check flow.

Sprint 18 core loop remains:
**Personalised plan → Guided check → Result → Corrective action → Verification → Record**

## Sprint 19 goal
Move the product from operational checking to management intelligence:
**See → Understand → Prioritise → Prevent → Improve**

## New manager experience
- `/manager` — Manager Overview / Food Safety Intelligence cockpit
- `/manager/risk/refrigeration` — Risk / recurring signal detail
- `/manager/risk/overdue-cleaning` — Corrective-action signal detail
- `/manager/risk/missed-checks` — Missed-check signal detail
- `/manager/trends` — Food safety trends
- `/manager/recommendations` — FoodSafe365 recommendations
- `/manager/people` — People & Training
- `/manager/equipment` — Equipment Health
- `/manager/documents` — Documents & Compliance

`/home` now redirects to `/manager` because the manager overview is the evolved Home experience.

## Important product rules
1. FoodSafe365 Control Status is an internal management measure, not an FSSAI Hygiene Rating.
2. Rules determine compliance; AI/recommendation logic interprets patterns and suggests actions.
3. Recommendations require human review and do not automatically declare a regulatory violation or diagnose a cause.
4. The worker-facing Sprint 18 guided-check language remains unchanged.

## Data architecture
`lib/sprint19-demo.ts` contains the Sprint 19 demo intelligence dataset so the UI can be reviewed without a production database.
`/api/v1/intelligence` exposes the same dataset through the existing API response wrapper as a starting contract for the production intelligence layer.

Suggested production tables/contracts:
- risk_signals
- recommendations
- trend_snapshots

These should be populated from observations, check responses, corrective actions, equipment, documents and training records rather than manually entered dashboard values.

## Validation
`npm run typecheck` passes.
`npm run build` could not complete in the build environment because Next.js attempted to download its native SWC package from npm and outbound network access was unavailable. No TypeScript errors were reported by the typecheck step.

## Phase 1 completion
Phase 1 is a usable manager-facing technical slice built on the Sprint 18 operational foundation.

Flow:
**Manager Overview → Control Status → Evidence → Recommended Check → Action Centre / Equipment → Records**

The recommended check at `/manager/risk/refrigeration/next-step` is a lightweight interactive demo flow. In production, responses should persist as observations and feed the existing corrective-action and verification workflow.

Phase 1 intentionally stops short of production AI diagnosis, automated regulatory conclusions, and multi-outlet analytics.
