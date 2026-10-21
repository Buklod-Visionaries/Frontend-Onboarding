# `lib/` — generic helpers

Utilities with no knowledge of this project. Nothing here mentions onboarding,
employees or requirements; anything that does belongs in `domain/`.

| File | Exports | Purpose |
| --- | --- | --- |
| `cx.js` | `cx(...args)` | Joins class names, skipping anything falsy. Accepts plain strings and `{ 'class-name': boolean }` maps, so conditional classes read as `cx('base', isActive && 'active')` or `cx({ 'is-open': open })`. Used by almost every component in `components/ui/`. |
| `utils.js` | `cn(...args)` | shadcn/ui's class helper: `cx` followed by `tailwind-merge`, so a later class overrides a conflicting earlier one. Configured with the custom `@theme` keys (`text-field`, `rounded-control`, …) so they are not mistaken for colours and dropped. Used by `components/shadcn/`. |

## Why not a dependency

`cx` is a dozen lines and does exactly what this project needs. Reaching for
`clsx` or `classnames` would add a package for the same behaviour. If class
merging ever becomes a real problem — Tailwind classes conflicting rather than
just concatenating — `tailwind-merge` would be the thing to add, and it would
slot in behind this same function signature. That is what `cn` in `utils.js`
does for the shadcn/ui components, which rely on overrides; `cx` itself is
unchanged.
