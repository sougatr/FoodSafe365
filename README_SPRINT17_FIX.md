# Sprint 17 Fix — Daily Check Navigation

Fixes the daily-check workflow so that after a check is recorded, the supervisor always has a **Next check** button.

If the result is **Action required**, the supervisor sees:
- **Open Actions Centre** (optional)
- **Next check** (continue the daily check list)

This keeps the daily workflow moving without forcing the supervisor into the corrective-action/verification workflow.

Verification note: dependency installation/build could not be rerun in the build environment because npm dependency downloads timed out. The source-level fix is isolated to the daily-check action bar and responsive styling.
