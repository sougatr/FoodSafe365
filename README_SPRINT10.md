# FoodSafe365 Sprint 10 — Guided HACCP & FSSAI-aligned UX

## Purpose
Simplify HACCP for restaurant users while preserving the critical control path:

FSSAI reference → outlet validated process → monitoring → deviation → corrective action → verification → records

## UX changes
- Renamed the main HACCP experience into four practical areas: Start here, Critical controls, Monitoring, Advanced HACCP.
- Added FSSAI-aligned reference guidance cards for Cooking, Cooling cooked food, Hot holding and Reheating.
- Made Cooling cooked food a prominent control because it is a common high-risk operational control.
- Separated FSSAI reference guidance from the outlet's validated HACCP critical limit.
- Reduced default form complexity. Operating details are progressive disclosure.
- Kept hazard analysis as an Advanced area rather than making every user fill it in.
- Added supervisor-oriented explanations of what to know, monitor and do when a deviation occurs.
- Added direct FSSAI hygiene guidance link.
- Preserved the existing integration with Daily Checks, Monitoring, Actions Centre and Records.

## Regulatory UX safeguard
FoodSafe365 does not present its own values as universal HACCP critical limits or as FSSAI certification. FSSAI reference guidance is informational; the outlet's approved and validated HACCP/process documentation remains the authoritative control reference.

## FSSAI references used in the demo guidance
- FSSAI Hygiene Rating criteria: https://hygiene.fssai.gov.in/
- FSSAI licensing/FSMS hygiene requirements: https://fssai.gov.in/upload/advisories/2020/08/5f3e073747828Direction_Operationalization_FSS_Licensing_Registration_19_08_2020.pdf

Note: FSSAI documents have shown different wording for the second stage of cooked-food cooling (e.g. a licensing direction specifies a further 4 hours, while current Hygiene Rating criteria displayed by FSSAI use a further 2 hours). The UI therefore labels the value as FSSAI reference guidance and requires the outlet's approved/validated process to be the operational control reference.

## Run
npm install
npm run typecheck
npm run build
npm run dev
