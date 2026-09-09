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

export const NAV = {
  hr: [
    { to: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/hr/users", label: "User management", icon: UserCog },
    { to: "/hr/employees", label: "Employees", icon: Users },
    {
      to: "/hr/requirements",
      label: "Requirements",
      icon: ClipboardCheck,
      badge: "verify",
    },
    {
      to: "/hr/notifications",
      label: "Notifications",
      icon: Bell,
      badge: "unread",
    },
    { to: "/hr/reports", label: "Reports", icon: ChartColumn },
    { to: "/hr/settings", label: "Settings", icon: Settings },
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
  department: "Department Representative",
};
