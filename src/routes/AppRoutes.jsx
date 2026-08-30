import { Navigate, Route, Routes } from 'react-router-dom';
import RoleGuard from './RoleGuard';

import Login from '../pages/auth/Login';
import AuthPlaceholder from '../pages/auth/AuthPlaceholder';
import PagePlaceholder from '../pages/PagePlaceholder';
import KitchenSink from '../KitchenSink';

/** Until the real page lands, every route renders a labelled placeholder. */
const page = (name, step) => <PagePlaceholder name={name} step={step} />;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/first-login"
        element={<AuthPlaceholder kicker="First-time login" title="Set your password" />}
      />
      <Route
        path="/forgot-password"
        element={<AuthPlaceholder kicker="Forgot password" title="Request a reset" />}
      />

      <Route path="/hr" element={<RoleGuard role="HR" />}>
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard" element={page('HR dashboard', 7)} />
        <Route path="users" element={page('User & account management', 7)} />
        <Route path="employees" element={page('Employee list', 7)} />
        <Route path="employees/new" element={page('Add employee', 7)} />
        <Route path="employees/:id" element={page('Employee profile', 7)} />
        <Route path="requirements" element={page('Requirement verification', 7)} />
        <Route path="notifications" element={page('Notifications', 8)} />
        <Route path="reports" element={page('Reports', 7)} />
        <Route path="completed" element={page('Completed records', 7)} />
        <Route path="settings" element={page('Settings', 7)} />
      </Route>

      <Route path="/employee" element={<RoleGuard role="Employee" />}>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={page('My onboarding', 8)} />
        <Route path="requirements" element={page('My requirements', 8)} />
        <Route path="requirements/:id" element={page('Requirement details', 8)} />
        <Route path="progress" element={page('Onboarding progress', 8)} />
        <Route path="notifications" element={page('Notifications', 8)} />
        <Route path="profile" element={page('My profile', 8)} />
      </Route>

      <Route path="/dept" element={<RoleGuard role="Department" />}>
        <Route index element={<Navigate to="/dept/dashboard" replace />} />
        <Route path="dashboard" element={page('Department dashboard', 8)} />
        <Route path="employees" element={page('Department employees', 8)} />
        <Route path="requirements" element={page('Department requirements', 8)} />
        <Route path="notifications" element={page('Notifications', 8)} />
      </Route>

      {/* TEMPORARY: visual regression check for components/ui. Removed before ship. */}
      <Route path="/kitchen-sink" element={<KitchenSink />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
