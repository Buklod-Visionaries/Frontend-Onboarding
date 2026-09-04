# `pages/hr/` — HR Staff screens

Eight screens behind `<RoleGuard role="HR" />`. HR is the administrative role:
it owns employee records, account management, document verification and reporting.

| File | Route | Purpose |
| --- | --- | --- |
| `HrDashboard.jsx` | `/hr/dashboard` | Five stat cards computed across all employees (total, in progress, pending requirements, overdue, completed), an "employees requiring attention" list filtered to anyone overdue or with more than three pending items, the recent activity feed, and the first four rows of the verification queue with inline Review. |
| `UserManagement.jsx` | `/hr/users` | Every account across the three roles in one table — staff users from the store plus employee accounts derived from the employee records, so the two can never drift apart. Search, role filter, and a temporary-password column with a copy button that appears only for accounts pending first login. Opens Create User, Manage access and the account receipt. |
| `EmployeeList.jsx` | `/hr/employees` | Searchable, department-filtered table of employee records with an inline progress bar and completion count per row. |
| `AddEmployee.jsx` | `/hr/employees/new` | Three numbered sections — employee information, position and department, account information — beside a live preview of the requirements the chosen position will assign. Changing the position updates both the read-only department field and the preview list. Creating shows the credential receipt, then returns to the employee list. |
| `EmployeeProfile.jsx` | `/hr/employees/:id` | One employee's record: header with status and progress, then the full requirements table. Review is enabled only on rows awaiting HR verification. Renders a not-found card for an unknown id. |
| `Verification.jsx` | `/hr/requirements` | The full verification queue — every submission awaiting HR review, with the submitted filename, dates and a Review action. |
| `Reports.jsx` | `/hr/reports` | Report type and department selectors. Nothing renders until Generate is pressed; then a stat strip and a per-employee breakdown table appear with a generated-at stamp. Changing either selector clears the result. |
| `Settings.jsx` | `/hr/settings` | Read-only account fields bound to the session, a password change with the same validation as first login, and two system settings (default deadline, reminder notice) bound to the store. |

