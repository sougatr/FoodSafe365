# FoodSafe365 Sprint 9 — HACCP Monitoring Integration

## Purpose
Connect validated HACCP/CCP monitoring directly to Daily Checks, Corrective Actions and Records.

## Operational loop
Validated CCP limit → CCP-linked Daily Check → server evaluation → monitoring record → deviation creates corrective action → verification → traceable history.

## Safety rules
- No universal HACCP critical limit is hard-coded.
- CCP limits must be established/validated for the actual process, food and equipment.
- A GHP/FSSAI control is not automatically a CCP.
- A monitoring deviation creates an action; it does not automatically declare a regulatory violation.

## Demo workflow
1. Open HACCP Plan → CCPs.
2. Enter the validated critical-limit statement, minimum/maximum numeric bounds and unit.
3. Mark Validation status = Validated and save.
4. Open Daily Checks.
5. The CCP-linked cooking measurement appears.
6. Enter a value inside the validated range: monitoring record is created, no action.
7. Enter a value outside the validated range: deviation is recorded and a corrective action is created.
8. Complete/submit the corrective action, verify it in Actions Centre.
9. Open Records → HACCP monitoring to see the measurement history.
