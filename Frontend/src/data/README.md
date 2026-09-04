# `data/` — static fixtures

Plain JavaScript objects and arrays. No React, no network, no framework imports.

| File | Contents |
| --- | --- |
| `positions.js` | Reference data rather than mock records — the tables a backend would also own. `POSITIONS` maps each of the seven positions to its department and the extra requirements it adds. `BASE_REQUIREMENTS` is the eight-item base set (4 documents, 4 registrations) with deadline offsets in days from the start date. `ACTIVITY_REQUIREMENTS` is the three department-confirmed activities. `REQUIREMENT_DESCRIPTIONS` provides the employee-facing explanation for each of the thirteen requirement names. |
| `employees.js` | `seedEmployees()` builds seven employee records with full personal, contact, government and education details. Each is assembled by running the real assignment rule for its position, then applying override codes — `C` completed, `S` submitted and awaiting HR, `R` resubmission requested. Two records (e6, e7) are pre-completed and archived. Called fresh each time so the store gets a private, mutable copy. |
| `accounts.js` | `STAFF_USERS` (two HR staff, three department representatives), `EMPLOYEE_ACCOUNT_STATUS` keyed by employee id, `ACTIVITY_LOG`, `NOTIFICATIONS` addressed to one of the three roles, `SESSION_PROFILES` giving one demo identity per role, and `ROLE_HOME` mapping a role to its landing path. |

## Fixed date

The seeded data is pinned to a fixed "today" of **2026-08-16**, defined as
`TODAY` in `domain/date.js`. That is what makes overdue counts and deadline
states read consistently rather than drifting as real time passes.

## Employee accounts are derived

The employee account rows in User Management are built from the employee records
plus `EMPLOYEE_ACCOUNT_STATUS`, not stored separately. That way an employee and
their account can never disagree about name, department or email.
