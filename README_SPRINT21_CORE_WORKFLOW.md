# FoodSafe365 Sprint 21 — Core Operational Workflow

This sprint implements the Phase 1 operational loop:

**Supervisor check-off → Manager review → Alert → Restaurant corrective action → Manager verification → Daily FoodSafe365 Badge**

## Workflow
1. Supervisor opens Today's Checks.
2. Supervisor completes an operational control and submits the result.
3. Every submitted result is marked `pending_manager`.
4. Manager reviews the supervisor result.
   - Good result → Manager approves.
   - Failed/attention result → Manager confirms an alert.
5. A manager-confirmed alert creates one corrective action for the restaurant.
6. Restaurant records immediate/corrective action and submits it for verification.
7. Manager verifies the correction.
   - Pass → issue and action close.
   - Fail → action reopens.
8. Daily badge is derived from actual records:
   - FOODSAFE TODAY: scheduled checks reviewed and no unresolved alerts.
   - FOODSAFE — ATTENTION: unresolved non-critical alert/action remains.
   - FOOD SAFETY ACTION REQUIRED: unresolved critical alert/action remains.

## Important
- No artificial/demo risk signals are seeded in this workflow.
- The browser localStorage key remains `foodsaf365_phase1` for Phase 1 testing.
- This is an operational prototype; the next backend sprint should persist observations, review decisions, alerts, actions and verification in PostgreSQL.
