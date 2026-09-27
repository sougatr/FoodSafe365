# FoodSafe365 Sprint 19 — Phase 1

Sprint 19 Phase 1 keeps the Sprint 18 operational workflow and connects the first management-intelligence loop end-to-end.

## End-to-end flow

**Evidence → Insight → Recommended check → Guided operational check → Result → Action → Verification → Record**

### Current implemented slice

1. **Manager Overview** (`/manager`)
   - FoodSafe365 Control Status
   - Factors affecting status
   - Recurring refrigeration signal
2. **Status explanation** (`/manager/status`)
   - Evidence behind the internal status measure
3. **Risk / recurring signal detail** (`/manager/risk/refrigeration`)
   - Recorded temperature evidence
   - Why the pattern matters
   - Possible contributing factors
4. **Recommended operational check** (`/manager/risk/refrigeration/next-step`)
   - Three short guided questions
   - WHY the question is being asked
   - Recorded result
   - If a concern is found, a corrective action is created
5. **Corrective Action** (`/actions/:id`)
   - Understand issue
   - Record immediate/corrective/root-cause information
   - Confirm correction completed
   - Submit for verification
6. **Verification**
   - Existing independent verification flow
   - Verified / Not verified / Conditional
7. **Records**
   - Existing Sprint 18 records/audit workflow remains the system of record

## Product boundary

Phase 1 intentionally does not attempt automated AI diagnosis or automatic regulatory conclusions.

- Rules determine compliance.
- Recorded evidence supports management review.
- FoodSafe365 recommendations suggest a next step.
- A human manager decides what action is appropriate.
- Verification remains a separate step from correction.

## Demo and production behavior

Without `DATABASE_URL`, the existing demo store is used. The new `POST /api/v1/actions` endpoint creates a demo corrective action that can then be opened, completed, submitted for verification and verified using the existing action APIs.

With `DATABASE_URL`, the same endpoint writes a `manual` corrective action to `corrective_actions`, adds activity/audit entries, and uses the existing verification workflow.

## Validation

Run:

```bash
npm install
npm run typecheck
npm run dev
```

Recommended manual acceptance test:

1. Open Manager Overview.
2. Open **88/100 → Understand status**.
3. Open **Refrigeration — 3 deviations**.
4. Start the recommended check.
5. Answer at least one question **No** or **Not sure**.
6. Complete the review.
7. Open the generated corrective action.
8. Record the correction.
9. Confirm completion.
10. Submit for verification.
11. Verify the action.
12. Confirm the action becomes **Closed**.


## Phase 1 flow audit fixes
- Answer cards now visibly highlight the selected response and expose `aria-pressed`.
- Demo Actions Centre now seeds refrigeration, cold-room drain and opening-hygiene actions instead of a single refrigerator action.
- Demo action updates correctly map API snake_case fields to the in-memory action model.
- Manager attention cards route to the relevant action/detail rather than defaulting to refrigeration.
- A dedicated missed-check detail route is available.
- Records timeline now reflects all demo corrective actions.
