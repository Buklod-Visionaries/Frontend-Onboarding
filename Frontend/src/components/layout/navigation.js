import {
  Bell,
  ChartColumn,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

// `section` (optional) groups rows under a small label in the mobile drawer.
export const NAV = {
  hr: [
    { to: "/hr/dashboard", section: "Workspace", label: "Dashboard", icon: LayoutDashboard },
    { to: "/hr/users", section: "Workspace", label: "User management", icon: UserCog },
    { to: "/hr/employees", section: "Workspace", label: "Employees", icon: Users },
    {
      to: "/hr/requirements",
      section: "Workspace",
      label: "Requirements",
      icon: ClipboardCheck,
      badge: "verify",
    },
    {
      to: "/hr/notifications",
      section: "Workspace",
      label: "Notifications",
      icon: Bell,
      badge: "unread",
    },
    { to: "/hr/reports", section: "Management", label: "Reports", icon: ChartColumn },
    { to: "/hr/settings", section: "Management", label: "Settings", icon: Settings },
  ],
  employee: [
    { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      to: "/employee/requirements",
      label: "My requirements",
      icon: ClipboardList,
    },
    {
      to: "/employee/notifications",
      label: "Notifications",
      icon: Bell,
      badge: "unread",
    },
  ],
  "dept-rep": [
    { to: "/dept/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      to: "/dept/requirements",
      label: "Department requirements",
      icon: ClipboardCheck,
    },
    {
      to: "/dept/notifications",
      label: "Notifications",
      icon: Bell,
      badge: "unread",
    },
  ],
};

export const ROLE_LABEL = {
  hr: "HR Staff",
  employee: "Employee",
  "dept-rep": "Department Representative",
};
