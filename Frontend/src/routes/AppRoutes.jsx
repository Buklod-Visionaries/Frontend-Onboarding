import { Navigate, Route, Routes } from 'react-router-dom';
import RoleGuard from './RoleGuard';

import Login from '../pages/auth/Login';
import FirstLogin from '../pages/auth/FirstLogin';
import ForgotPassword from '../pages/auth/ForgotPassword';

import HrDashboard from '../pages/hr/HrDashboard';
import UserManagement from '../pages/hr/UserManagement';
import EmployeeList from '../pages/hr/EmployeeList';
import AddEmployee from '../pages/hr/AddEmployee';
import EmployeeProfile from '../pages/hr/EmployeeProfile';
import Verification from '../pages/hr/Verification';
import Reports from '../pages/hr/Reports';
import Settings from '../pages/hr/Settings';

import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import MyRequirements from '../pages/employee/MyRequirements';
import RequirementDetail from '../pages/employee/RequirementDetail';

import DeptDashboard from '../pages/dept/DeptDashboard';
import DeptRequirements from '../pages/dept/DeptRequirements';

import Notifications from '../pages/Notifications';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/first-login" element={<FirstLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/hr" element={<RoleGuard role="HR" />}>
        <Route index element={<Navigate to="/hr/dashboard" replace />} />
        <Route path="dashboard" element={<HrDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<AddEmployee />} />
        <Route path="employees/:id" element={<EmployeeProfile />} />
        <Route path="requirements" element={<Verification />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Route>

      <Route path="/employee" element={<RoleGuard role="Employee" />}>
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="requirements" element={<MyRequirements />} />
        <Route path="requirements/:id" element={<RequirementDetail />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      <Route path="/dept" element={<RoleGuard role="Department" />}>
        <Route index element={<Navigate to="/dept/dashboard" replace />} />
        <Route path="dashboard" element={<DeptDashboard />} />
        <Route path="requirements" element={<DeptRequirements />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/dept/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
