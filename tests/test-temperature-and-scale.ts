import {
  FOODSAFE28,
  calculateDailyBadge,
  isScheduledCheck,
  evaluateTemperature,
  RATING_DEFINITIONS,
  CheckRecord,
  Issue
} from '../lib/foodsafety28';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
  console.log(`✓ ${msg}`);
}

console.log('--- Testing FoodSafe365 Updated Temperature & 1-5 Rating Scale ---');

// 1. Verify Temperature evaluations
// Cool room: < 5°C (and >= 0°C)
const crValid = evaluateTemperature('FS28-14', 3.5, 'cool');
assert(crValid.acceptable === true, 'Cool Room at 3.5°C is acceptable (< 5°C)');

const crLow = evaluateTemperature('FS28-14', -1.0, 'cool');
assert(crLow.acceptable === false, 'Cool Room at -1.0°C requires attention (below 0°C)');

const crHigh = evaluateTemperature('FS28-14', 5.0, 'cool');
assert(crHigh.acceptable === false, 'Cool Room at 5.0°C requires attention (not < 5°C)');

// Cold room: < -18°C
const frValid = evaluateTemperature('FS28-14', -19.0, 'cold');
assert(frValid.acceptable === true, 'Cold Room at -19.0°C is acceptable (< -18°C)');

const frWarm = evaluateTemperature('FS28-14', -15.0, 'cold');
assert(frWarm.acceptable === false, 'Cold Room at -15.0°C requires attention (not < -18°C)');

// Cool storage (FS28-19): < 5°C
const refValid = evaluateTemperature('FS28-19', 4.0);
assert(refValid.acceptable === true, 'Cool storage at 4.0°C is acceptable (< 5°C)');

const refWarm = evaluateTemperature('FS28-19', 5.2);
assert(refWarm.acceptable === false, 'Cool storage at 5.2°C requires attention (not < 5°C)');

// Cold storage (FS28-20): < -18°C
const coldValid = evaluateTemperature('FS28-20', -19.5);
assert(coldValid.acceptable === true, 'Cold storage at -19.5°C is acceptable (< -18°C)');

const coldWarm = evaluateTemperature('FS28-20', -16.0);
assert(coldWarm.acceptable === false, 'Cold storage at -16.0°C requires attention (not < -18°C)');

// 2. Verify 1 to 5 Qualitative Rating Scale
assert(RATING_DEFINITIONS[5].acceptable === true, 'Rating 5 is acceptable');
assert(RATING_DEFINITIONS[4].acceptable === true, 'Rating 4 is acceptable');
assert(RATING_DEFINITIONS[3].acceptable === false, 'Rating 3 needs attention');
assert(RATING_DEFINITIONS[2].acceptable === false, 'Rating 2 requires alert');
assert(RATING_DEFINITIONS[1].acceptable === false && RATING_DEFINITIONS[1].severity === 'critical', 'Rating 1 is critical hazard alert');

// 3. Workflow loop with rating scale
const scheduled = FOODSAFE28.filter(isScheduledCheck);
let checks: Record<string, CheckRecord> = {};
let issues: Issue[] = [];

// Supervisor records rating 5 on Check 1, and rating 2 on Check 5
checks['FS28-01'] = {
  status: 'good',
  value: '5/5 — Excellent',
  time: new Date().toISOString(),
  reviewStatus: 'pending_manager'
};

checks['FS28-05'] = {
  status: 'attention',
  value: '2/5 — Unsatisfactory · Note: "Missing hand-soap at main line station"',
  time: new Date().toISOString(),
  reviewStatus: 'pending_manager'
};

let b1 = calculateDailyBadge(checks, issues, scheduled);
assert(b1.status === 'PENDING MANAGER REVIEW', 'With pending submissions, badge is PENDING MANAGER REVIEW');

console.log('--- ALL TEMPERATURE LIMITS & 1-5 SCALE TESTS PASSED ---');

