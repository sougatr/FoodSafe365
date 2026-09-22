# FoodSafe365 — Sprint 14 UX / Navigation Reset

This build separates HACCP, the FSSAI-aligned operational checklist, temperature controls, and daily/focused checks while preserving the existing rules-engine → corrective-action → verification → records workflow.

See `README_SPRINT14_UX_NAVIGATION_RESET.md` for the detailed changes and test journey.

## Sprint 15 — Focused Check Architecture
Focused temperature-control checks remain single-control workflows after starting. They do not reload the generic Daily Checks list, so Storage/Cooking/Cooling/Thawing/Reheating display 1 of 1 and only their relevant measurement.
