import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastHost from './ToastHost';
import { useApp } from '../../hooks/useApp';

/** Page titles per route, so Header stays declarative. */
const TITLES = {
  '/hr/dashboard': ['HR', 'Dashboard'],
  '/hr/users': ['HR', 'User & account management'],
  '/hr/employees': ['HR / Employees', 'Employee list'],
  '/hr/employees/new': ['HR / Employees', 'Add employee'],
  '/hr/requirements': ['HR / Requirements', 'Requirement verification'],
  '/hr/notifications': ['HR Staff', 'Notifications'],
  '/hr/reports': ['HR', 'Reports'],
  '/hr/completed': ['HR', 'Completed records'],
  '/hr/settings': ['HR', 'Settings'],
  '/employee/dashboard': ['Employee', 'My onboarding'],
  '/employee/requirements': ['Employee', 'My requirements'],
  '/employee/progress': ['Employee', 'Onboarding progress'],
  '/employee/notifications': ['Employee', 'Notifications'],
  '/employee/profile': ['Employee', 'My profile'],
  '/dept/dashboard': ['Laboratory Department', 'Dashboard'],
  '/dept/employees': ['Laboratory Department', 'Employees'],
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

/** Submissions sitting in the HR verification queue. */
function countAwaitingVerification(employees) {
  let total = 0;
  for (const employee of employees) {
    for (const requirement of employee.requirements ?? []) {
      if (requirement.status === 'In Progress' && requirement.subLabel === 'Awaiting HR verification') {
        total += 1;
      }
    }
  }
  return total;
}

export default function AppShell() {
  const app = useApp();
  const location = useLocation();
  const role = app.session.role;
  const [crumb, title] = titleFor(location.pathname);

  const unreadCount = app.notifications.filter((n) => n.to === role && n.unread).length;
  const verifyCount = countAwaitingVerification(app.employees);

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
