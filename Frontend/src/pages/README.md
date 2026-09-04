# `pages/` — screens

Thirteen screens, one per route. A page composes `ui/` primitives and `feature/`
components, reads through `useApp()` and the hooks, and owns its own local UI
state (filters, search text, which dialog is open). No page imports from `data/`.

Each page is rendered inside `AppShell`, which supplies the sidebar and header —
pages render only their content column.

| File | Route | Purpose |
| --- | --- | --- |
| `Notifications.jsx` | `/hr/notifications`, `/employee/notifications`, `/dept/notifications` | One screen serving all three roles. Filters `app.notifications` by the session role, shows the unread count or "All caught up", and offers Mark all as read. |

