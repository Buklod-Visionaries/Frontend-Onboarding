import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastHost from './ToastHost';
import { useApp } from '../../hooks/useApp';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';

/** Page titles per route, so Header stays declarative. */
const TITLES = {
  '/hr/dashboard': ['HR', 'Dashboard'],
  '/hr/users': ['HR', 'User & account management'],
  '/hr/employees': ['HR / Employees', 'Employee list'],
  '/hr/employees/new': ['HR / Employees', 'Add employee'],
  '/hr/requirements': ['HR / Requirements', 'Requirement verification'],
  '/hr/notifications': ['HR Staff', 'Notifications'],
  '/hr/reports': ['HR', 'Reports'],
  '/hr/settings': ['HR', 'Settings'],
  '/employee/dashboard': ['Employee', 'My onboarding'],
  '/employee/requirements': ['Employee', 'My requirements'],
  '/employee/notifications': ['Employee', 'Notifications'],
  '/dept/dashboard': ['Laboratory Department', 'Dashboard'],
  '/dept/requirements': ['Laboratory Department', 'Department requirements'],
  '/dept/notifications': ['Department Representative', 'Notifications']
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/hr/employees/')) return ['HR / Employees', 'Employee profile'];
  if (pathname.startsWith('/employee/requirements/')) {
    return ['Employee / Requirements', 'Requirement details'];
  }
  return ['', ''];
}

export default function AppShell() {
  const app = useApp();
  const location = useLocation();
  const role = app.session.role;
  const [crumb, title] = titleFor(location.pathname);

  const unreadCount = app.notifications.filter((n) => n.to === role && n.unread).length;
  const verifyCount = useVerificationQueue().length;

  return (
    <div className="min-h-screen lg:grid" style={{ gridTemplateColumns: '236px 1fr' }}>
      <Sidebar unreadCount={unreadCount} verifyCount={verifyCount} />
      <main className="flex min-w-0 flex-col">
        <Header crumb={crumb} title={title} />
        <div className="flex w-full max-w-[1440px] flex-col gap-6 p-7">
          <Outlet />
        </div>
      </main>
      <ToastHost />
    </div>
  );
}
