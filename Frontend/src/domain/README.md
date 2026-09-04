# `domain/` — business rules

Pure functions and constants. **No React, no hooks, no components, no network.**
Given the same input these always return the same output, so they can be called
from the store, from pages, or from a test without any setup.

| File | Exports | Purpose |
| --- | --- | --- |
| `date.js` | `TODAY`, `formatDate(iso)`, `addDays(iso, n)` | `TODAY` pins the prototype to 2026-08-16 so seeded deadlines read consistently. `formatDate` turns `2026-08-03` into `Aug 3, 2026` and passes blanks and em dashes straight through. |
| `constants.js` | `DEPARTMENTS`, `ROLES`, `STATUSES`, `ACCOUNT_STATUSES`, `SUB_LABELS`, `TEMP_PASSWORD`, `EM_DASH` | The vocabulary of the system in one place, so filters, badges and dialogs cannot drift apart. |
| `requirements.js` | `buildRequirements`, `isOverdue`, `countRequirements`, `isAwaitingVerification`, `verificationQueue`, `activityQueue` | The requirement rules. `buildRequirements(position, startDate, idPrefix)` is the automatic assignment: base set + the position's extras + the three activities, each with a deadline offset from the start date. `countRequirements` returns totals plus a completion percentage. |
| `employees.js` | `employeeStatus`, `ACTIVITY_MILESTONE` | `employeeStatus` derives Pending / In Progress / Completed from the requirement counts rather than storing it. `ACTIVITY_MILESTONE` maps an activity name to the milestone it would flip. |

## Rules worth knowing

**Statuses are only three.** Pending, In Progress and Completed. "Awaiting HR
verification", "Resubmission requested", "Verified by HR" and "Confirmed by
department" are *sub-labels* layered on top of a status, never statuses of their
own. `SUB_LABELS` holds them.

**Requirement ids are derived, not counted.** `buildRequirements` builds ids from
the prefix and the requirement name — `e1-transcript-of-records`. The reference
prototype used a module-level counter, which produced different ids depending on
import order. The `idPrefix` argument also lets Add Employee preview a list
before any record exists.

**Requirements differ by position and department.** A Medical Technologist gets
thirteen; an Administrative Assistant gets eleven. The difference is the position's
extras in `data/positions.js`.

