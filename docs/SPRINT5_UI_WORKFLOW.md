# FoodSafe365 — Sprint 5 UI Workflow

This increment connects the existing Home/Checks experience to the Sprint 4 workflow APIs.

Flow implemented in `/checks`:
1. Daily Checks list
2. Start check
3. One-question-at-a-time response
4. Server evaluation
5. Good / Needs Attention / Action Required result
6. Corrective action capture
7. Evidence capture (demo storage reference in no-DB mode)
8. Submit for verification
9. Verification result
10. Completion summary

The browser does not determine regulatory applicability or critical limits. It submits responses and renders the server result.
