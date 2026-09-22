# Sprint 15 — Focused Check Architecture

## Objective
Separate the restaurant-wide Daily Checks workflow from focused control checks launched from Temperature Controls.

## UX rule
A focused control must never inherit the generic daily checklist UI or progress count.

Examples:
- Temperature Controls → Storage → Check Storage Now → Storage Check → 1 of 1
- Temperature Controls → Cooking → Check Cooking Now → Cooking Check → 1 of 1
- Temperature Controls → Cooling → Check Cooling Now → Cooling Check → 1 of 1
- Temperature Controls → Thawing → Check Thawing Now → Thawing Check → 1 of 1
- Temperature Controls → Reheating → Check Reheating Now → Reheating Check → 1 of 1

## Technical correction
The previous flow called `load()` after `/checks/{check_id}/start`. That reload returned the generic daily check and replaced the locally filtered focused item list. Sprint 15 keeps the focused item list after start and only updates the local check status.

## Shared backend flow
Focused and daily checks continue to use the same server evaluation, corrective-action, verification and record APIs.

Daily Checks = scheduled restaurant-wide workflow.
Focused Checks = single-control measurement workflow.
