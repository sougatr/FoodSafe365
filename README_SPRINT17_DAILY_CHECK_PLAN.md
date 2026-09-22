# FoodSafe365 Sprint 17 — Personalised Daily Check Plan

## Objective
Connect onboarding to simple, personalised daily operational checks without exposing HACCP/FSSAI classification to the supervisor.

## Flow
Restaurant setup → Food processes → Equipment → Auto-generated Control Plan → Today’s food-safety checks → Individual check → Answer/measurement → rules engine → result → next check / Actions Centre.

## UX principles
- One daily checklist; no duplicate Action/Actions Centre entry points here.
- Supervisor sees controls that apply to the outlet, not rule IDs or HACCP terminology.
- Temperature controls ask for a measurement; other controls use Yes / No / Not applicable.
- The rules engine remains underneath the UX.
- Verification screen is intentionally not changed in Sprint 17.
- On a deviation, the supervisor can open Actions Centre; the existing corrective-action lifecycle remains available.

## Implementation note
`lib/daily-check-plan.ts` maps generated control-plan items to human-readable daily questions and frequency. The MVP uses the existing server response endpoint when a check instance is available and falls back to a demo evaluator otherwise.
