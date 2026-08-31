import { cx } from '../../lib/cx';

/** Requirement + account status badges. One component, one variant map. */
const VARIANTS = {
  Completed: 'bg-accent-200 text-accent-800',
  'In Progress': 'border border-accent text-accent-700',
  Pending: 'bg-neutral-200 text-neutral-800',
  Active: 'bg-accent-200 text-accent-800',
  'Pending first login': 'border border-accent text-accent-700',
  Deactivated: 'bg-neutral-200 text-neutral-800',
  overdue: 'bg-accent-900 text-bg uppercase tracking-[0.1em] text-micro'
};

export default function Badge({ variant, className, children }) {
  const key = variant || children;
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap px-2.5 py-[3px] text-[11px] leading-tight',
        VARIANTS[key] || VARIANTS.Pending,
        className
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
