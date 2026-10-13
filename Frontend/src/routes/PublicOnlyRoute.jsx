import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../hooks/useApp";

export default function PublicOnlyRoute() {
  const app = useApp();

  if (app.sessionLoading) {
    return <p>Loading...</p>;
  }

  if (app.session) {
    const home =
      app.session.role === "dept-rep" ? "/dept" : `/${app.session.role}`;

    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
