# `pages/employee/` — Employee screens

Three screens behind `<RoleGuard role="Employee" />`. The employee sees only
their own record, resolved from the session by `useCurrentEmployee()`.

| File | Route | Purpose |
| --- | --- | --- |
| `EmployeeDashboard.jsx` | `/employee/dashboard` | Overall progress as a large percentage with a progress bar and a four-figure strip (completed, in progress, pending, overdue). Below it, "Needs your action" listing up to five incomplete requirements the employee owns, and the three most recent notifications. |
| `MyRequirements.jsx` | `/employee/requirements` | All requirements with a status filter (All, In Progress, Pending, Completed, Resubmission Required; `?status=` sets the starting value). A table from 1024px, one record card per requirement below that. The call to action adapts to state — *Upload document* when in progress, *View details* otherwise — and only document requirements open the detail page. |
| `RequirementDetail.jsx` | `/employee/requirements/:id` | One requirement: status, deadline, overdue badge, the description from the requirement catalogue, and the resubmission reason when HR has sent one back. Below that, the upload dropzone and the submission history. Renders a not-found card for an unknown id. |
