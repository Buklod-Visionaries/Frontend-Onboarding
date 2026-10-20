import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Button from "../ui/Button";
import { Segmented } from "../ui/Field";
import { useApp } from "../../hooks/useApp";

const ROLE_OPTIONS = [
  { value: "HR", label: "HR" },
  { value: "Employee", label: "Employee" },
  { value: "Department", label: "Dept" },
];

/**
 * Page header: breadcrumb + title, demo role switcher. Below lg it also holds
 * the hamburger that opens the sidebar drawer.
 */
export default function Header({ crumb, title, menuButtonRef, navOpen, onOpenNav }) {
  const app = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-4 border-b border-divider bg-bg px-5 py-4.5 sm:px-7">
      <Button
        ref={menuButtonRef}
        variant="icon"
        className="shrink-0 lg:hidden"
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        aria-expanded={navOpen}
        onClick={onOpenNav}
      >
        <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
      </Button>

      <div className="mr-auto min-w-0">
        <div className="text-micro uppercase text-ink/50">{crumb}</div>
        <h3 className="mt-0.5 text-[25px]">{title}</h3>
      </div>

      {/* <div className="flex flex-wrap items-center gap-2.5">
        <span className="hidden text-micro uppercase text-ink/50 sm:inline">
          Demo role
        </span>
        <Segmented
          value={app.session.role}
          onChange={(next) => navigate(app.login(next))}
          options={ROLE_OPTIONS}
        />
      </div> */}
    </header>
  );
}
