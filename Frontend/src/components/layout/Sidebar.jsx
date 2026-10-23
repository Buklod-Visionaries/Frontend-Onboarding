import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { cx } from "../../lib/cx";
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

/**
 * The deep accent navigation rail. From lg it is a sticky full-height column;
 * below lg (`drawer`) it is a fixed slide-in drawer that AppShell opens from
 * the header's hamburger. Either way the layout stays vertical.
 */
/** Screen-reader context read after each badge count. */
const BADGE_LABEL = { verify: "awaiting verification", unread: "unread" };

export default function Sidebar({ unreadCount, verifyCount, drawer, open, onClose, onNavigate }) {
  const app = useApp();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeButtonRef = useRef(null);

  // Move focus into the drawer when it opens.
  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);
  const role = app.session.role;
  const items = NAV[role];
  // Consecutive rows sharing a `section` render together under one label.
  const groups = items.reduce((acc, item) => {
    const last = acc[acc.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else acc.push({ section: item.section, items: [item] });
    return acc;
  }, []);
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
    <aside
      id="app-sidebar"
      aria-label="Main navigation"
      // Off-screen below lg: inert keeps its links out of the tab order.
      inert={drawer && !open}
      className={cx(
        // h-screen is the fallback for browsers without dvh.
        "fixed inset-y-0 left-0 z-40 flex h-screen h-dvh w-[min(85vw,300px)] flex-col overflow-hidden bg-accent-900 text-bg shadow-lg transition-transform duration-200 ease-out motion-reduce:transition-none",
        "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none lg:transition-none",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-bg/[0.14] px-5 pb-4 pt-5 max-lg:min-h-[72px] max-lg:items-center max-lg:py-3.5 max-lg:pr-3.5">
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[19px] tracking-[0.04em]">
            PMCL &middot; Onboarding
          </div>
          <div className="mt-0.5 text-micro uppercase opacity-55">
            {roleLabel}
          </div>
        </div>
        <Button
          ref={closeButtonRef}
          variant="icon"
          className="size-10 shrink-0 border-bg/25! text-bg! hover:bg-bg/10! focus-visible:outline-accent-300! lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      </div>

      {/* min-h-0 lets only this region scroll, so the account footer stays reachable. */}
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2.5 py-3.5 scroll-thin max-lg:gap-1 max-lg:px-3 max-lg:py-2">
        {groups.map((group, gi) => (
          <div
            key={group.section || gi}
            role={group.section ? "group" : undefined}
            aria-labelledby={group.section ? `nav-section-${gi}` : undefined}
            className="flex flex-col gap-0.5 max-lg:gap-1"
          >
            {group.section && (
              // Section labels are a drawer-only aid; the desktop rail stays flat.
              <div
                id={`nav-section-${gi}`}
                className="px-3 pb-1 pt-3 text-micro uppercase text-bg/55 lg:hidden"
              >
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
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
                  badgeLabel={BADGE_LABEL[item.badge]}
                  onClick={onNavigate}
                />
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-bg/[0.14] px-5 py-4 max-lg:bg-ink/25 max-lg:pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="min-w-0">
          <div className="truncate text-cell max-lg:text-field max-lg:font-medium">
            {currentUser?.username || currentEmployeeUser?.user.username || ""}
          </div>
          <div className="mb-2.5 truncate text-[11px] opacity-55 max-lg:mb-3 max-lg:text-meta">
            {capitalize(position)}
          </div>
        </div>
        <Button
          className="w-full border-bg/30! text-bg! hover:bg-bg/10! focus-visible:outline-accent-300! max-lg:min-h-11"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut size={15} strokeWidth={1.75} aria-hidden="true" className="lg:hidden" />
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
