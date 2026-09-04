# `services/` — the data seam

**These files run entirely in the browser and make no network call.** Each
function returns a static fixture from `data/`. They exist so that when a real
API arrives, this folder is the only place that changes.

| File | Exports | Returns |
| --- | --- | --- |
| `employeeService.js` | `loadEmployees()` | The seeded employee records, built fresh on each call so the store owns a private copy. |
| `accountService.js` | `loadStaffUsers()`, `loadEmployeeAccountStatus()`, `loadActivityLog()` | Copies of the staff user list, the employee account-status map, and the recent activity feed. |
| `notificationService.js` | `loadNotifications()` | A copy of the notification list. Notifications are in-app only — there is no email or SMS in scope. |

