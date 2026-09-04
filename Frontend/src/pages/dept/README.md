# `pages/dept/` — Department Representative screens

Two screens behind `<RoleGuard role="Department" />`. A representative sees only
their own department, scoped by `useDepartmentScope()`.

Their responsibility is narrow: confirming the three onboarding **activities** —
Orientation, Department Training and Team Introduction. Document verification
stays with HR.

| File | Route | Purpose |
| --- | --- | --- |
| `DeptDashboard.jsx` | `/dept/dashboard` | Four stat cards (employees in the department, pending confirmations, orientation done, training done) over a table of activities still awaiting confirmation, each with a Confirm action. |
| `DeptRequirements.jsx` | `/dept/requirements` | The same work grouped by activity instead of by employee — one card per activity, each listing the department's employees with their status and a Confirm button on the incomplete ones. |

