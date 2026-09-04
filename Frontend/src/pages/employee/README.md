# `pages/employee/` — Employee screens

Three screens behind `<RoleGuard role="Employee" />`. The employee sees only
their own record, resolved from the session by `useCurrentEmployee()`.

| File | Route | Purpose |
| --- | --- | --- |
| `EmployeeDashboard.jsx` | `/employee/dashboard` | Overall progress as a large percentage with a progress bar and a four-figure strip (completed, in progress, pending, overdue). Below it, "Needs your action" listing up to five incomplete requirements the employee owns, and the three most recent notifications. |
| `MyRequirements.jsx` | `/employee/requirements` | All requirements as cards, with a status filter (All, Pending, In Progress, Completed). Each card is a `RequirementCard` whose call to action adapts to the requirement's state. |
| `RequirementDetail.jsx` | `/employee/requirements/:id` | One requirement: status, deadline, overdue badge, the description from the requirement catalogue, and the resubmission reason when HR has sent one back. Below that, the upload dropzone and the submission history. Renders a not-found card for an unknown id. |
