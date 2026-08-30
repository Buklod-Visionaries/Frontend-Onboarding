import { NavLink } from 'react-router-dom';
import { cx } from '../../lib/cx';

/** Sidebar row on the deep accent field: lucide icon, label, optional count badge. */
export default function SidebarItem({ to, label, icon: Icon, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          'flex items-center gap-2.5 border px-3 py-[9px] font-heading text-[15px] text-bg transition-colors',
          isActive
            ? 'border-bg/40 bg-bg/[0.14]'
            : 'border-transparent opacity-70 hover:opacity-100 hover:bg-bg/[0.08]'
        )
      }
    >
      <Icon size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="bg-bg px-[7px] font-heading text-[10px] text-accent-900">{badge}</span>
      ) : null}
    </NavLink>
  );
}
