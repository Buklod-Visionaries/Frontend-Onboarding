import { NavLink } from 'react-router-dom';
import { cx } from '../../lib/cx';

/**
 * Sidebar row on the deep accent field: lucide icon, label, optional count badge.
 * Unprefixed classes are the desktop rail; `max-lg:` classes restyle the row for
 * the mobile drawer (48px touch rows, left accent on the active route).
 * `badgeLabel` is read after the count by screen readers ("3 unread").
 */
export default function SidebarItem({ to, label, icon: Icon, badge, badgeLabel, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-2.5 border px-3 py-[9px] font-heading text-[15px] text-bg transition-colors',
          // Blush focus ring: the global terracotta outline is too faint on maroon.
          'focus-visible:outline-accent-300 focus-visible:-outline-offset-2',
          'max-lg:min-h-12 max-lg:gap-3 max-lg:border-0 max-lg:border-l-[3px] max-lg:py-2.5 max-lg:pl-3 max-lg:pr-3.5 max-lg:text-[16px]',
          isActive
            ? 'border-bg/40 bg-bg/[0.14] max-lg:border-l-accent-400 max-lg:bg-bg/[0.12]'
            : 'border-transparent opacity-70 hover:opacity-100 hover:bg-bg/[0.08] max-lg:border-l-transparent max-lg:active:bg-bg/[0.14]'
        )
      }
    >
      <Icon size={16} strokeWidth={1.5} className="shrink-0 max-lg:size-[18px]" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-left">{label}</span>
      {badge ? (
        <span
          className={cx(
            'bg-bg px-[7px] font-heading text-[10px] text-accent-900 tabular-nums',
            'max-lg:min-w-6 max-lg:bg-bg/[0.16] max-lg:py-0.5 max-lg:text-center max-lg:text-[12px] max-lg:text-bg'
          )}
        >
          {badge}
          {badgeLabel && <span className="sr-only"> {badgeLabel}</span>}
        </span>
      ) : null}
    </NavLink>
  );
}
