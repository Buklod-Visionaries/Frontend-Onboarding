import { cx } from "../../lib/cx";

/**
 * Requirement + account status badges. One component, one variant map.
 * Colours follow the same semantic tones as StatCard: green = done/active,
 * amber = in progress/awaiting, red = overdue, neutral = inactive. The badge
 * text always names the status, so colour is never the only signal.
 */
const VARIANTS = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  active: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "in-progress": "border-amber-300 bg-amber-50 text-amber-900",
  in_progress: "border-amber-300 bg-amber-50 text-amber-900",
  pending: "border-amber-300 bg-amber-50 text-amber-900",
  deactivated: "border-neutral-300 bg-neutral-200 text-neutral-800",
  overdue: "border-red-200 bg-red-50 text-red-800 uppercase tracking-[0.1em] text-micro font-medium",
};
const NEUTRAL = "border-neutral-300 bg-neutral-100 text-neutral-800";

export default function Badge({ variant, className, children }) {
  const key = variant || children;
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap border px-2.5 py-[3px] text-[11px] leading-tight",
        VARIANTS[key] || NEUTRAL,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Renders only when `when` is true, so callers can pass a predicate inline. */
export function OverdueBadge({ when }) {
  if (!when) return null;
  return (
    <Badge variant="overdue" className="px-2 py-[2px]">
      Overdue
    </Badge>
  );
}
