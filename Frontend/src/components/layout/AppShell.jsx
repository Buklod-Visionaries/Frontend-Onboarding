import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cx } from "../../lib/cx";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ToastHost from "./ToastHost";
import { useApp } from "../../hooks/useApp";
import { useVerificationQueue } from "../../hooks/useVerificationQueue";

/** Page titles per route, so Header stays declarative. */
const TITLES = {
  "/hr/dashboard": ["HR", "Dashboard"],
  "/hr/users": ["HR", "User & account management"],
  "/hr/employees": ["HR / Employees", "Employee list"],
  "/hr/employees/new": ["HR / Employees", "Add employee"],
  "/hr/requirements": ["HR / Requirements", "Requirement verification"],
  "/hr/notifications": ["HR Staff", "Notifications"],
  "/hr/reports": ["HR", "Reports"],
  "/hr/settings": ["HR", "Settings"],
  "/employee/dashboard": ["Employee", "My onboarding"],
  "/employee/requirements": ["Employee", "My requirements"],
  "/employee/notifications": ["Employee", "Notifications"],
  "/dept/dashboard": ["Laboratory Department", "Dashboard"],
  "/dept/requirements": ["Laboratory Department", "Department requirements"],
  "/dept/notifications": ["Department Representative", "Notifications"],
};

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/hr/employees/"))
    return ["HR / Employees", "Employee profile"];
  if (pathname.startsWith("/employee/requirements/")) {
    return ["Employee / Requirements", "Requirement details"];
  }
  return ["", ""];
}

/** Matches Tailwind's `lg` breakpoint, where the sidebar becomes a fixed rail. */
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeDesktop(onChange) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
  );
}

export default function AppShell() {
  const app = useApp();
  const location = useLocation();
  const role = app.session.role;
  const [crumb, title] = titleFor(location.pathname);
  const isDesktop = useIsDesktop();
  const [navState, setNavOpen] = useState(false);
  // The drawer only exists below lg; widening the window closes it.
  const navOpen = navState && !isDesktop;
  const menuButtonRef = useRef(null);

  const unreadCount = app.notifications.filter(
    (n) => n.to === role && n.unread,
  ).length;
  const verifyCount = useVerificationQueue().length;

  console.log("appshell:", role);

  const closeNav = useCallback((returnFocus = true) => {
    setNavOpen(false);
    // Wait a frame: <main> is still inert until the close re-renders.
    if (returnFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  // Crossing into lg resets the drawer, so narrowing again doesn't reopen it.
  useEffect(() => subscribeDesktop((event) => event.matches && setNavOpen(false)), []);

  // While the drawer is open: Escape closes it, and the page behind can't scroll.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event) => {
      // The sign-out dialog handles its own Escape; leave the drawer open under it.
      if (event.key !== "Escape" || document.querySelector('[aria-modal="true"]')) return;
      closeNav();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [navOpen, closeNav]);

  return (
    <div
      className="min-h-screen lg:grid"
      style={{ gridTemplateColumns: "236px 1fr" }}
    >
      <Sidebar
        unreadCount={unreadCount}
        verifyCount={verifyCount}
        drawer={!isDesktop}
        open={navOpen}
        onClose={() => closeNav()}
        onNavigate={() => closeNav(false)}
      />

      {/* Drawer backdrop (below lg only). */}
      <div
        aria-hidden="true"
        onClick={() => closeNav()}
        className={cx(
          "fixed inset-0 z-30 bg-ink/45 transition-opacity duration-200 motion-reduce:transition-none lg:hidden",
          navOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* inert while the drawer is open, so focus stays inside the drawer. */}
      <main className="flex min-w-0 flex-col" inert={navOpen}>
        <Header
          crumb={crumb}
          title={title}
          menuButtonRef={menuButtonRef}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
        />
        <div className="flex w-full max-w-[1440px] flex-col gap-6 p-5 sm:p-7">
          <Outlet />
        </div>
      </main>
      <ToastHost />
    </div>
  );
}
