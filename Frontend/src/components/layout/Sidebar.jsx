import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import Button from "../ui/Button";
import SignOutDialog from "../feature/accounts/SignOutDialog";
import { NAV } from "./navigation";
import { useApp } from "../../hooks/useApp";
//
import { useCurrentUser, useCurrentEmployeeUser } from "../../hooks/useUsers";
import { useRequirements } from "../../hooks/useRequirements";
import { useAllOwnNotif } from "../../hooks/useNotifications";
import { capitalize } from "../../lib/capitalize";

export default function Sidebar({ unreadCount, verifyCount }) {
  const app = useApp();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const role = app.session.role;
  const items = NAV[role];
  //if user is either hr or dept rep
  const {
    data: currentUser,
    isLoading: currentUserLoading,
    isError: currentUserError,
  } = useCurrentUser(app.session.accessToken);
  //if user is employee
  const {
    data: currentEmployeeUser,
    isLoading: currentEmployeeUserLoading,
    isError: currentEmployeeUserError,
  } = useCurrentEmployeeUser(app.session.accessToken);
  //from req hook
  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    isError: requirementsError,
  } = useRequirements(app.session.accessToken);
  //from notif hook
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useAllOwnNotif(app.session.accessToken);

  let position = "";
  let roleLabel = "";

  const signOut = () => {
    setConfirmOpen(false);
    app.logout();
    navigate("/login");
  };

  if (currentUser) {
    if (currentUser.role === "hr") {
      position = "HR Staff";
      roleLabel = "Administration";
    } else if (currentUser.role === "dept-rep") {
      position = "Department Representative";
      roleLabel = currentUser.department;
    } else if (currentUser.role === "employee") {
      position = currentEmployeeUser?.position ?? "";
      roleLabel = currentUser.department;
    }
  }
  return (
    <aside className="flex flex-col bg-accent-900 text-bg lg:sticky lg:top-0 lg:h-screen">
      <div className="border-b border-bg/[0.14] px-5 pb-4 pt-5">
        <div className="font-heading text-[19px] tracking-[0.04em]">
          PMCL &middot; Onboarding
        </div>
        <div className="mt-0.5 text-micro uppercase opacity-55">
          {roleLabel}
        </div>
      </div>

      <nav className="flex flex-1 flex-wrap gap-0.5 overflow-auto p-2.5 lg:flex-col lg:flex-nowrap lg:px-2.5 lg:py-3.5 scroll-thin">
        {items.map((item) => {
          const badge =
            item.badge === "verify"
              ? requirements.filter((req) => req.status === "pending").length
              : item.badge === "unread"
                ? notifications.filter((notif) => !notif.isRead).length
                : 0;

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

      {/* Sits inline on the accent field at every width — below lg the sidebar is a
          stacked block, so this row keeps sign-out reachable on small screens. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-bg/[0.14] px-5 py-4 lg:block">
        <div className="min-w-0 flex-1 lg:flex-none">
          <div className="text-cell">
            {currentUser?.username || currentEmployeeUser?.user.username || ""}
          </div>
          <div className="text-[11px] opacity-55 lg:mb-2.5">
            {capitalize(position)}
          </div>
        </div>
        <Button
          className="border-bg/30! text-bg! hover:bg-bg/10! lg:w-full"
          onClick={() => setConfirmOpen(true)}
        >
          Sign out
        </Button>
      </div>

      <SignOutDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={signOut}
        name={app.session.name}
      />
    </aside>
  );
}
