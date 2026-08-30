import { useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import Button from '../ui/Button';
import { NAV, ROLE_LABEL } from './navigation';
import { useApp } from '../../hooks/useApp';

export default function Sidebar({ unreadCount, verifyCount }) {
  const app = useApp();
  const navigate = useNavigate();
  const role = app.session.role;
  const items = NAV[role];
  const counts = { unread: unreadCount, verify: verifyCount };

  return (
    <aside className="flex flex-col bg-accent-900 text-bg lg:sticky lg:top-0 lg:h-screen">
      <div className="border-b border-bg/[0.14] px-5 pb-4 pt-5">
        <div className="font-heading text-[19px] tracking-[0.04em]">PMCL &middot; Onboarding</div>
        <div className="mt-0.5 text-micro uppercase opacity-55">{ROLE_LABEL[role]}</div>
      </div>

      <nav className="flex flex-1 flex-wrap gap-0.5 overflow-auto p-2.5 lg:flex-col lg:flex-nowrap lg:px-2.5 lg:py-3.5 scroll-thin">
        {items.map((item) => {
          const badge = item.badge ? counts[item.badge] : 0;
          return (
            <SidebarItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              badge={badge ? String(badge) : null}
            />
          );
        })}
      </nav>

      <div className="hidden border-t border-bg/[0.14] px-5 py-4 lg:block">
        <div className="text-cell">{app.session.name}</div>
        <div className="mb-2.5 text-[11px] opacity-55">{app.session.title}</div>
        <Button
          block
          className="border-bg/30! text-bg! hover:bg-bg/10!"
          onClick={() => {
            app.logout();
            navigate('/login');
          }}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
