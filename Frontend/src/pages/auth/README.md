# `pages/auth/` — signed-out screens

Three screens reached before a session exists. They render inside `AuthLayout`
(accent panel on the left, centred card on the right) rather than `AppShell`,
since there is no sidebar or header without a session.

| File | Route | Purpose |
| --- | --- | --- |
| `Login.jsx` | `/login` | Role picker for the prototype with pre-filled, read-only credentials. Signing in calls `app.login(role)` and navigates to the path it returns. Links out to first-time login and forgot password. |
| `FirstLogin.jsx` | `/first-login` | Replaces the temporary password HR issued. Validates at least six characters and that both fields match, warning through a toast and staying put on failure. On success it signs the user in as the employee and lands on their dashboard. |
| `ForgotPassword.jsx` | `/forgot-password` | Two states in one screen. The form validates that an email was entered; submitting raises an in-app HR notification through `app.notify` and swaps the form for a success notice, keeping only the link back to sign in. |
