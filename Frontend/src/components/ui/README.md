# `components/ui/` — design system primitives


| File | Exports | What it does |
| --- | --- | --- |
| `Button.jsx` | `Button` | Four variants: `primary` (solid accent, square corners), `secondary` (default, hairline border), `ghost` (accent text, no border), `icon` (36×36 square). Plus `block` for full width and standard `disabled`. |
| `Card.jsx` | `Card` | Hairline-bordered section. `padding` accepts `sm` (18px), `md` (20px, default), `lg` (22px) or `none`. |
| `Badge.jsx` | `Badge`, `OverdueBadge` | Status pill covering the six statuses — Pending, In Progress, Completed, Active, Pending first login, Deactivated. `OverdueBadge` renders only when its `when` prop is true, so callers can pass a predicate inline. |
| `Field.jsx` | `Field`, `Input`, `Textarea`, `Select`, `Radio`, `Segmented` | Every form control. `Field` is the label + hint wrapper. `Select` and `Segmented` accept plain strings or `{ value, label }` objects. `Segmented` doubles as the tab and filter control. |
| `Modal.jsx` | `Modal` | Dialog over a dimmed backdrop. Closes on Escape and backdrop click. Takes `kicker`, `title`, `subtitle`, `actions` and a `width` override. Sets `text-ink` explicitly so it renders correctly even when mounted inside the dark sidebar. |
| `Table.jsx` | `Table`, `TableScroll`, `THead`, `TRow`, `TCell` | Themed data table. `TableScroll` gives every table its own horizontal scroll container, which is why no page overflows on mobile. `THead` columns accept `{ label, align }` for right-aligned action columns. |
| `ProgressBar.jsx` | `ProgressBar` | Accent fill on a neutral track. Heights `sm`, `md`, `lg`. |
| `StatCard.jsx` | `StatCard`, `StatStrip` | `StatCard` is the dashboard metric tile — kicker, large condensed figure, context line. `StatStrip` is the compact divider-separated row of figures. |
| `Timeline.jsx` | `EventList` | Dotted activity feed. `round` switches the square marks to dots. |
| `Notice.jsx` | `Notice`, `EmptyState`, `SectionHeading` | `Notice` is the accent-tinted inline callout. `EmptyState` is the dashed "nothing here" box. `SectionHeading` is the numbered step heading used by multi-section forms. |
| `Toast.jsx` | `Toast` | Fixed bottom-right confirmation. Renders nothing when `message` is empty. |
| `DividerList.jsx` | `DividerList`, `DividerRow` | Hairline-separated stack. The container paints the divider colour and 1px grid gaps let it show between opaque rows. `DividerRow` supplies the row background; its `as` prop swaps the element (`button` for clickable rows). |
| `AutoGrid.jsx` | `AutoGrid` | The responsive column pattern used throughout: `repeat(auto-fit, minmax(<min>px, 1fr))`. Columns collapse on their own, so pages need no breakpoint classes. |
| `CopyField.jsx` | `CopyField` | A readable secret with a copy button that confirms with a "Copied" state for two seconds. Tries the async Clipboard API, falls back to `document.execCommand` when that is blocked, and calls `onError` if both fail. |

