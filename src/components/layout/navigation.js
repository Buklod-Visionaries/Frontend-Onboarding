import {
  Bell,
  ChartColumn,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserCog,
  Users
} from 'lucide-react';

/**
 * Role-based navigation. This map is the single source of truth for the sidebar
 * and for which routes each role may reach.
 *
 * `icon` is a lucide-react component rendered at the head of the row.
 * `badge` names a count the layout supplies: 'unread' (notifications for the
 * signed-in role) or 'verify' (submissions awaiting HR verification).
 */
export const NAV = {
  HR: [
    { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hr/users', label: 'User management', icon: UserCog },
    { to: '/hr/employees', label: 'Employees', icon: Users },
    { to: '/hr/requirements', label: 'Requirements', icon: ClipboardCheck, badge: 'verify' },
    { to: '/hr/notifications', label: 'Notifications', icon: Bell, badge: 'unread' },
    { to: '/hr/reports', label: 'Reports', icon: ChartColumn },
    { to: '/hr/settings', label: 'Settings', icon: Settings }
  ],
  Employee: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/requirements', label: 'My requirements', icon: ClipboardList },
    { to: '/employee/notifications', label: 'Notifications', icon: Bell, badge: 'unread' }
  ],
  Department: [
    { to: '/dept/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dept/requirements', label: 'Department requirements', icon: ClipboardCheck },
    { to: '/dept/notifications', label: 'Notifications', icon: Bell, badge: 'unread' }
  ]
};

export const ROLE_LABEL = {
  HR: 'HR Staff',
  Employee: 'Employee',
  Department: 'Department Representative'
};
