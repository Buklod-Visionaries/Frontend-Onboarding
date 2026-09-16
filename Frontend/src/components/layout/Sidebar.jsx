import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import Button from "../ui/Button";
import SignOutDialog from "../feature/accounts/SignOutDialog";
import { NAV, ROLE_LABEL } from "./navigation";
import { useApp } from "../../hooks/useApp";
//
import api from "../../lib/axios";

export default function Sidebar({ unreadCount, verifyCount }) {
  const app = useApp();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const role = app.session.role;
  const items = NAV[role];
  const counts = { unread: unreadCount, verify: verifyCount };
  const [username, setUsername] = useState("");
  const [position, setPosition] = useState("");
  const [roleLabel, setRoleLabel] = useState("");

  const signOut = () => {
    setConfirmOpen(false);
    app.logout();
    navigate("/login");
  };

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const res = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setUsername(res.data.username);
        if (res.data.role === "hr") {
          setPosition("HR Staff");
          setRoleLabel("Administration");
          return;
        }

        setRoleLabel(res.data.department);
        if (res.data.role === "dept-rep") {
          setPosition(`Department Representative`);
          return;
        }
      } catch (error) {
        console.log(error.response.data);
      }
    }

    console.log("Dep", roleLabel);

    //just to set position of employees
    async function getCurrentEmployeeUser() {
      try {
        const res = await api.get("/employees/me", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setPosition(res.data.position);
      } catch (error) {
        console.log(error.response.data);
      }
    }

    getCurrentUser();
    getCurrentEmployeeUser();
  }, []);

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
          const badge = item.badge ? counts[item.badge] : 0;
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
          <div className="text-cell">{username}</div>
          <div className="text-[11px] opacity-55 lg:mb-2.5">{position}</div>
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
