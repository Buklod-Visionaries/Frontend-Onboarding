# `routes/` — routing and access control

| File | Purpose |
| --- | --- |
| `AppRoutes.jsx` | The complete route table. Three public auth routes, then one block per role wrapped in a `RoleGuard`, then a catch-all. |
| `RoleGuard.jsx` | Guards a role's block. No session redirects to `/login`; a session belonging to a different role redirects to that role's own dashboard; otherwise it renders `AppShell`, whose `<Outlet />` hosts the matched page. |

## The route table

**Public**

| Path | Screen |
| --- | --- |
| `/` | redirect to `/login` |
| `/login` | Login |
| `/first-login` | FirstLogin |
| `/forgot-password` | ForgotPassword |

**HR** — `/hr/*`, guarded

`dashboard` · `users` · `employees` · `employees/new` · `employees/:id` ·
`requirements` · `notifications` · `reports` · `settings`

**Employee** — `/employee/*`, guarded

`dashboard` · `requirements` · `requirements/:id` · `notifications`

**Department** — `/dept/*`, guarded

`dashboard` · `requirements` · `notifications`

