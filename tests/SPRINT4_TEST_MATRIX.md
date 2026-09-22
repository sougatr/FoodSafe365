# Sprint 4 Test Matrix

## Rule evaluation
- YES / PASS configured value -> GOOD
- NO / FAIL configured value -> ACTION_REQUIRED
- Warning configured value -> ATTENTION
- NA -> NOT_APPLICABLE
- Invalid numeric input -> NOT_VERIFIED
- Numeric rule without validated configured limit -> NOT_VERIFIED
- Numeric value outside configured limit -> ACTION_REQUIRED
- Pest rule inversion: visible activity -> ACTION_REQUIRED; no activity -> GOOD

## Workflow
1. Start check.
2. Submit response.
3. Server evaluates response.
4. Failure/warning creates observation and corrective action.
5. Required applicable responses reach 100% -> check completed.
6. Action submitted for verification.
7. Authorised verifier records pass/fail/conditional.
8. Pass closes action and resolves linked observation; fail/conditional reopens workflow.

## Security
- Unauthenticated protected route -> 401.
- User from outlet A cannot read/write outlet B.
- Evidence entity must belong to same outlet and organisation.
- Food handler cannot verify actions.
- Completed/cancelled check cannot accept responses.
- Action can only be verified from awaiting_verification state.

## Production gates still outstanding
- Real password hashing / JWT or equivalent session service.
- Refresh-token rotation and MFA for privileged roles.
- Presigned object-storage upload instead of trusting client file URLs.
- Malware scanning and content inspection for uploaded evidence.
- Automated DB-backed integration tests.
- Formal validation of each rule against the current applicable FSSAI source/version.
- Process-specific HACCP critical limits must be supplied by validated SOP/HACCP configuration, never invented by the UI or generic AI.
