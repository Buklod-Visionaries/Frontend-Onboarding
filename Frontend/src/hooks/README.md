# `hooks/` — reading and deriving from the store

Small hooks that sit between the store and the pages. Each one puts a rule in a
single place so pages do not repeat it.

| File | Exports | Purpose |
| --- | --- | --- |
| `useApp.js` | `useApp()` | The context accessor. Throws a clear error if used outside `<AppProvider>` rather than returning `null` and failing further down. Every other hook and every store-aware component goes through it. |
| `useCurrentEmployee.js` | `useCurrentEmployee()` | The employee record behind an Employee session, resolved from `session.employeeId`. Employee pages use this instead of reaching for the id themselves. |
| `useDepartmentScope.js` | `useDepartmentScope()` | Everything a department representative may see: their department name, the employees in it, and those employees' activity requirements flattened into `{ employee, requirement }` rows. Memoised on the employee list. The scoping rule lives only here. |
| `useVerificationQueue.js` | `useVerificationQueue()` | Every submission awaiting HR review as `{ employee, requirement }` rows. Memoised. Used by the HR dashboard, the verification page and `AppShell` for the sidebar badge — one definition, three consumers. |

