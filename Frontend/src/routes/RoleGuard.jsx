import { Navigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { ROLE_HOME } from "../data/accounts";
import { useApp } from "../hooks/useApp";
//
import { Outlet } from "react-router-dom";

/**
 * Role-based access. Employees cannot reach HR routes, department
 * representatives cannot reach HR administration, and so on. An unauthenticated
 * visit goes to /login; a signed-in user on another role's route is sent to
 * their own dashboard.
 */
export default function RoleGuard({ role }) {
  const app = useApp();

  //this is important to not get into timing bugs
  if (app.sessionLoading) {
    return <p>Loading...</p>;
  }
  console.log("roleguard:", app.session);
  if (!app.session) return <Navigate to="/login" replace />;
  if (app.session.role !== role)
    return <Navigate to={ROLE_HOME[app.session.role]} replace />;
  //THIS IS A BUG it render another dashboard inside another dashbaord
  // return <AppShell />;
  return <Outlet />;
}
