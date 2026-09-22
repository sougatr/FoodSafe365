# FoodSafe365 Sprint 8 — HACCP & Food Safety Plan

Adds a structured HACCP working-plan layer above daily checks and corrective actions.

## Flow
Home → HACCP & Food Safety Plan → Plan overview → Hazard analysis → CCPs → Monitoring & records.

## Safety/product guardrails
- FSSAI/GHP controls are not automatically CCPs.
- CCP determination is process-specific and requires an appropriate decision process.
- Critical limits must be validated for the actual food/process/equipment; no universal hard-coded limit is assumed.
- FoodSafe365 plan status is operational/inspection-readiness status and is not an official FSSAI Hygiene Rating or certification.
- Demo mode stores state in memory; production integration maps to haccp_plans, hazards, ccps and monitoring_records.
