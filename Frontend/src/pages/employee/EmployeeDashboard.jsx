import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import AutoGrid from "../../components/ui/AutoGrid";
import DividerList, { DividerRow } from "../../components/ui/DividerList";
import { StatStrip } from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/Notice";
import { cx } from "../../lib/cx";
import { useApp } from "../../hooks/useApp";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { countRequirements } from "../../domain/requirements";
import { formatDate } from "../../domain/date";
//
import { useState, useEffect } from "react";
import api from "../../lib/axios.js";

export default function EmployeeDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  // const me = useCurrentEmployee();
  const [user, setUser] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);
  // const counts = countRequirements(req);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        setLoading(true);
        const res = await api.get("/employees/me", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }

    async function getUserRequirements() {
      try {
        setReqLoading(true);
        const res = await api.get("/employee-requirements/me", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setRequirements(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      } finally {
        setReqLoading(false);
      }
    }

    getCurrentUser();
    getUserRequirements();
  }, []);

  console.log("requiremens:", requirements);
  const actionable = requirements
    .filter(
      (requirement) =>
        requirement.status !== "Completed" && requirement.owner === "Employee",
    )
    .slice(0, 5);

  const notifications = app.notifications
    .filter((notification) => notification.to === "Employee")
    .slice(0, 3);

  //avoid rendering when currentUser is not yet fetched
  if (loading || !user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <>
        <Card padding="lg" className="gap-4">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="text-micro uppercase text-accent-700">
                Overall onboarding progress
              </div>
              <h2 className="mt-1.5 text-[34px]">{user.user.username}</h2>
              <div className="text-cell text-ink/55">
                {user.position} &middot; {user.department} &middot; Started{" "}
                {formatDate(user.user.createdAt)}
              </div>
            </div>
            <div className="font-heading text-[56px] leading-none">
              {requirements.length
                ? Math.round(
                    (requirements.filter((req) => req.status === "completed")
                      .length /
                      requirements.length) *
                      100,
                  )
                : 0}
              %
            </div>
          </div>
          <ProgressBar
            value={
              requirements.length
                ? Math.round(
                    (requirements.filter((req) => req.status === "completed")
                      .length /
                      requirements.length) *
                      100,
                  )
                : 0
            }
            height="lg"
          />
          <StatStrip
            min={140}
            items={[
              { label: "Completed", value: requirements.completed },
              { label: "In progress", value: requirements.progress },
              { label: "Pending", value: requirements.pending },
              { label: "Overdue", value: requirements.overdue },
            ]}
          />
        </Card>

        <AutoGrid min={320}>
          <Card className="gap-3">
            <div className="flex items-baseline">
              <h4 className="text-[20px]">Needs your action</h4>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => navigate("/employee/requirements")}
              >
                All requirements
              </Button>
            </div>
            {actionable.length ? (
              <DividerList>
                {actionable.map((requirement) => (
                  <DividerRow
                    key={requirement.id}
                    as="button"
                    type="button"
                    onClick={() =>
                      navigate(`/employee/requirements/${requirement.id}`)
                    }
                    className="flex items-center gap-3 px-3.5 py-3 text-left hover:bg-accent-100"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-field font-medium">
                        {requirement.name}
                      </span>
                      <span className="block text-meta text-ink/55">
                        {requirement.subLabel} &middot; due{" "}
                        {formatDate(requirement.deadline)}
                      </span>
                    </span>
                    <Badge>{requirement.status}</Badge>
                  </DividerRow>
                ))}
              </DividerList>
            ) : (
              <EmptyState>Nothing needs your action right now.</EmptyState>
            )}
          </Card>

          <Card className="gap-3">
            <div className="flex items-baseline">
              <h4 className="text-[20px]">Recent notifications</h4>
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => navigate("/employee/notifications")}
              >
                View all
              </Button>
            </div>
            {notifications.length ? (
              <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "8px 1fr" }}
                  >
                    <span
                      className={cx(
                        "mt-1.5 h-[7px] w-[7px] rounded-full",
                        notification.unread ? "bg-accent" : "bg-neutral-400",
                      )}
                    />
                    <div>
                      <div className="text-field font-medium">
                        {notification.title}
                      </div>
                      <div className="text-cell text-ink/60">
                        {notification.body}
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink/45">
                        {notification.time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No notifications yet.</EmptyState>
            )}
          </Card>
        </AutoGrid>
      </>
    </>
  );
}
