# `components/layout/` — application shell

The chrome around every page: the sidebar, the header, the authentication
split-screen, and the toast host. Unlike `components/ui/`, files here may read
the store — they need the session and the notification counts.

| File | Purpose |
| --- | --- |
| `AppShell.jsx` | The signed-in frame. A `236px 1fr` grid holding `Sidebar` and a `main` column of `Header` + `<Outlet />`. Owns the route→title map that feeds the header breadcrumb and title, and derives the two sidebar badge counts. Rendered by `RoleGuard`, never routed to directly. |
| `Sidebar.jsx` | The deep accent rail. Brand block, numbered-free icon nav from `navigation.js`, and the account footer with the sign-out button. Holds the open/closed state for `SignOutDialog`. |
| `SidebarItem.jsx` | One nav row: lucide icon, label, optional count badge. Uses `NavLink` so the active state comes from the router rather than manual path comparison. |
| `Header.jsx` | Sticky page header — breadcrumb, page title, and the demo role switcher that calls `app.login(role)` and navigates to that role's home. |
| `AuthLayout.jsx` | The signed-out frame. Accent-900 panel on the left with the organisation name and system title, centred card slot on the right. Shared by all three auth screens. |
| `ToastHost.jsx` | Bridges the store to the presentational `ui/Toast`. Exists so `ui/` can stay free of app state. Mounted in both `AppShell` and `AuthLayout`. |
| `navigation.js` | The single source of truth for the sidebar: `NAV` maps each role to its rows (path, label, lucide icon, optional badge key) and `ROLE_LABEL` maps a role to its display name. |

## Responsive behaviour

Everything is driven by Tailwind's `lg:` breakpoint (1024px):

- **≥1024px** — sidebar is a sticky full-height 236px rail; the account footer stacks name, title, then a full-width button.
- **<1024px** — the shell becomes a single column, the sidebar sits at the top with its nav wrapping horizontally, and the account footer becomes one row with the name on the left and the sign-out button on the right.
