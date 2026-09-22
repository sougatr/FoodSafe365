# FoodSafe365 Sprint 13 — Operational Temperature Controls

## Purpose
Connect the five supervisor-facing priority controls to the existing Daily Checks → rules engine → corrective action → verification → records flow.

## Supervisor experience
The supervisor can open a priority card and choose **Check now**. Daily Checks focuses the corresponding operational control first. The supervisor is not asked to classify it as FSSAI or HACCP.

## Five controls
1. Storage — FS-STO-005
2. Cooking — FS-PREP-003
3. Cooling — FS-PREP-005
4. Thawing — FS-PREP-007
5. Reheating — FS-PREP-006

## Important architecture rule
FSSAI reference guidance and HACCP classification remain separate metadata layers. A control may be FSSAI-aligned without being a CCP. A CCP is determined by the outlet-specific hazard analysis and validated HACCP plan.

## Existing database installations
Run `db/migrations_sprint13_temperature_controls.sql` after Sprint 12. Fresh installs can use the updated `db/seed.sql`.
