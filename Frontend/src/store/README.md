# `store/` — application state

One React context holding the session, the mock records and the actions pages
call. All client-side; nothing here reaches the network.

| File | Purpose |
| --- | --- |
| `AppContext.js` | Just `createContext(null)`. Kept in its own non-JSX module so the provider file exports only a component, which keeps `react-refresh/only-export-components` satisfied and hot reload working. |
| `AppStore.jsx` | `AppProvider` — loads the fixtures once through `services/`, holds the session and toast, and exposes the value below. |

## What the context provides

**Records** (read-only — loaded once, never reassigned)
`employees` · `activity`

**Records the UI writes back**
`staffUsers`, `employeeAccounts` (via `updateAccount`) · `notifications` (via `notify` and `markAllRead`) · `settings` (via `setSettings`)

**Session** — `session`, `login(role)`, `logout()`
`login` returns the role's home path so the caller can navigate straight there.

**Feedback** — `toast`, `showToast(text)`
One global toast, cleared after 3.2 seconds.

**Lookup** — `getEmployee(id)`

## Onboarding actions are UI-only

These seven show a toast and return whatever a dialog needs to render, but they
**do not modify any record**:

| Action | Returns |
| --- | --- |
| `submitDocument(requirement)` | — |
| `approveRequirement(requirement)` | — |
| `requestResubmission(employee)` | — |
| `confirmActivity(employee, requirement)` | — |
| `sendReminder(employee)` | — |
| `createEmployee(form)` | a receipt: name, role, department derived from the position, work email, temporary password, requirement count |
| `createStaffUser(draft)` | the same receipt shape, with a requirement count of zero |

This is deliberate for the UI-first prototype. Pages still render, navigate,
open dialogs, validate forms and show feedback; a refresh returns everything to
the seeded fixtures.

The consequence worth knowing: **cross-role effects do not propagate.** An
employee submission does not appear in HR's verification queue, and confirming
an activity does not move the department's milestone counters.

`updateAccount` and `markAllRead` are the exceptions — they only flip local UI
state that a table or a badge reads straight back, so they stay live.

## Adding a backend later

The signatures above are the seam. Give these functions real implementations and
no page changes, because nothing outside this file and `services/` knows where
the data comes from.

One thing to redo when that happens: `createEmployee` currently returns a receipt
without inserting a record, so `AddEmployee` returns to the employee list rather
than to the new employee's page.
