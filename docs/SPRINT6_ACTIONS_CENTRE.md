# FoodSafe365 Sprint 6 — Actions Centre + Corrective-Action Lifecycle

## Objective
Operationalise the lifecycle: **Issue → Correct → Submit → Verify → Close**.

## Delivered
- Actions Centre with All/Open/In progress/Awaiting verification/Closed views.
- Action counts including overdue/escalated.
- Action detail page.
- Corrective-action fields: immediate action, corrective action, root cause, preventive action, assignee and due date.
- Explicit completion confirmation before submission for verification.
- Independent verification with Verified / Not verified / Conditional outcomes.
- Server-side tenant/outlet access checks for persisted actions.
- Audit logging for action updates and verification.
- Demo-mode endpoints so the UI can be exercised before database connection.

## Important workflow rule
`awaiting_verification` is a distinct state. Recording that an action was completed does not itself close the action.

## Evidence
Evidence capture remains a separate storage/device integration item. Sprint 6 does not block on camera/file capture.
