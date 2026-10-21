import { useState } from "react";
import { cx } from "../../lib/cx";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useNavigate } from "react-router-dom";
import { CircleAlert, FileClock, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import AutoGrid from "../../components/ui/AutoGrid";
import { EventList } from "../../components/ui/Timeline";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Notice";
import ReviewDialog from "../../components/feature/requirements/ReviewDialog";
import { useApp } from "../../hooks/useApp";
import { formatDate, isOverdue } from "../../domain/date";
//
import { capitalize } from "../../lib/capitalize";
import { useQueryClient } from "@tanstack/react-query";
import { useRequirements } from "../../hooks/useRequirements";
import { useAllOwnNotif } from "../../hooks/useNotifications";
import { useEmployees } from "../../hooks/useEmployees";

export default function HrDashboard() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  //from employee hooks
  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
  } = useEmployees(app.session.accessToken);

  //from requirement hooks
  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    isError: requirementsError,
  } = useRequirements(app.session.accessToken);
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useAllOwnNotif(app.session.accessToken, 6);

  ////
  if (employeesLoading || requirementsLoading || notificationsLoading) {
    return <LoadingState />;
  }

  if (employeesError) {
    return <ErrorState>Failed loading employees.</ErrorState>;
  }
  if (requirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }
  if (notificationsError) {
    return <ErrorState>Failed loading employee requirements history.</ErrorState>;
  }

  const overdueCount = requirements.filter(
    (req) =>
      (req.status === "in-progress" ||
        req.status === "resubmission-required") &&
      isOverdue(formatDate(req.dueDate)),
  ).length;

  // Active employees with a submission to review or an overdue requirement;
  // one list feeds the check and the rows.
  const attention = employees.filter(
    (employee) =>
      employee.onboardingStatus !== "deactivated" && //exclude deactivated employees requirement
      requirements.some(
        (req) =>
          req.employee._id === employee._id &&
          (req.status === "pending" ||
            (req.status !== "completed" && isOverdue(formatDate(req.dueDate)))),
      ),
  );

  // One list feeds the count, the desktop table and the mobile cards.
  const awaiting = requirements.filter(
    (req) =>
      req.status === "pending" &&
      req.employee.onboardingStatus !== "deactivated", //exclude deactivated employees requirement
  );

  return (
    <>
      {/* Two-up on phones; from md the original auto-fit columns (min 190px). */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard
          to="/hr/employees"
          label="Total employees"
          value={employees.length}
          note="Onboarding records on file"
          icon={Users}
        />
        <StatCard
          to="/hr/employees"
          label="Employees in progress"
          value={
            employees.filter((emp) => emp.onboardingStatus === "in_progress")
              .length
          }
          note="Onboarding not yet complete"
          tone="warning"
        />
        <StatCard
          to="/hr/reports"
          label="Requirements in progress"
          value={
            requirements.filter(
              (req) =>
                req.status === "in-progress" &&
                req.employee.onboardingStatus === "in_progress",
            ).length
          }
          note="Not yet submitted"
          tone="warning"
          icon={FileClock}
        />
        <StatCard
          to="/hr/employees"
          label="Overdue requirements"
          value={overdueCount}
          note="Past deadline"
          // Red only when something is actually overdue.
          tone={overdueCount > 0 ? "danger" : "neutral"}
          icon={CircleAlert}
        />
        <StatCard
          to="/hr/reports"
          label="Onboarding completed" // is the completed referring to employees onboarding itself?
          value={
            employees.filter((emp) => emp.onboardingStatus === "completed")
              .length
          }
          note="Fully onboarded"
          tone="success"
        />
      </div>

      <AutoGrid min={340}>
        <Card className="gap-3.5">
          <div className="flex items-baseline gap-2.5">
            <h4 className="text-[20px]">Employees requiring attention</h4>
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => navigate("/hr/employees")}
            >
              View all
            </Button>
          </div>
          {attention.length ? (
            <div className="flex flex-col">
              {attention.slice(0, 4).map((employee) => {
                const mine = requirements.filter(
                  (req) => req.employee._id === employee._id,
                );
                const overdue = mine.filter(
                  (req) =>
                    req.status !== "completed" &&
                    isOverdue(formatDate(req.dueDate)),
                ).length;
                const pendingCount = mine.filter(
                  (req) => req.status === "pending",
                ).length;
                // "2 overdue · 1 pending", leaving out whichever is zero.
                const summary = [
                  overdue > 0 && `${overdue} overdue`,
                  pendingCount > 0 && `${pendingCount} pending review`,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <button
                    key={employee._id}
                    type="button"
                    onClick={() => navigate(`/hr/employees/${employee._id}`)}
                    className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-ink/[0.08] px-2 py-3 text-left transition-colors last:border-0 hover:bg-ink/[0.03]"
                  >
                    <span className="min-w-0 break-words text-field font-medium">
                      {employee.user.username}
                    </span>

                    <Badge
                      className="justify-self-end"
                      variant={
                        employee.onboardingStatus === "in_progress"
                          ? "in-progress"
                          : "completed"
                      }
                    >
                      {employee.onboardingStatus === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                    </Badge>
                    <span
                      className={cx(
                        "text-meta",
                        overdue > 0 ? "font-medium text-red-800" : "text-ink/55",
                      )}
                    >
                      {summary}
                    </span>

                    {/* Full width under the name on phones; right column from sm. */}
                    <span className="col-span-2 text-[11px] text-ink/55 sm:col-span-1 sm:text-right">
                      {capitalize(employee.department)} &middot;{" "}
                      {capitalize(employee.position)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState>No employees need attention right now.</EmptyState>
          )}
        </Card>

        <Card className="gap-3.5">
          <h4 className="text-[20px]">Recent onboarding activity</h4>
          {notifications.length > 0 ? (
            <EventList items={notifications} notifications round />
          ) : (
            <EmptyState>No recent onboarding activity yet.</EmptyState>
          )}
        </Card>
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-[20px]">Awaiting verification</h4>
          <span className="text-meta text-ink/55">
            {awaiting.length}{" "}
            {awaiting.length === 1 ? "submission" : "submissions"} in queue
          </span>
          <Button
            className="w-full sm:ml-auto sm:w-auto"
            onClick={() => navigate("/hr/requirements")}
          >
            Open verification queue
          </Button>
        </div>
        {awaiting.length > 0 ? (
          <>
            {/* md and up: the existing table. */}
            <div className="hidden md:block">
              <Table>
                <THead
                  columns={[
                    "Employee",
                    "Requirement",
                    "Submitted",
                    "Deadline",
                    { label: "", align: "right" },
                  ]}
                />
                <tbody>
                  {awaiting
                    .map((row) => (
                      <TRow key={row._id}>
                        <TCell strong>{row.employee.user.username}</TCell>
                        <TCell>{row.requirement.name}</TCell>
                        <TCell>{formatDate(row.updatedAt)}</TCell>
                        <TCell>{formatDate(row.dueDate)}</TCell>
                        <TCell align="right">
                          <Button onClick={() => setReview(row)}>Review</Button>
                        </TCell>
                      </TRow>
                    ))
                    .slice(0, 5) //only show 5
                  }
                </tbody>
              </Table>
            </div>

            {/* Below md: one card per submission, same rows and Review action. */}
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:hidden">
              {awaiting.slice(0, 5).map((row) => {
                const overdue = isOverdue(formatDate(row.dueDate));
                return (
                  <li
                    key={row._id}
                    className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                  >
                    <div className="min-w-0">
                      <div className="break-words text-field font-medium">
                        {row.employee.user.username}
                      </div>
                      <div className="break-words text-cell text-ink/70">
                        {row.requirement.name}
                      </div>
                    </div>
                    <dl className="m-0 grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-micro uppercase text-ink/55">Submitted</dt>
                        <dd className="m-0 text-cell">{formatDate(row.updatedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-micro uppercase text-ink/55">Deadline</dt>
                        <dd className="m-0 flex flex-wrap items-center gap-1.5 text-cell">
                          <span className={overdue ? "font-medium text-red-800" : undefined}>
                            {formatDate(row.dueDate)}
                          </span>
                          <OverdueBadge when={overdue} />
                        </dd>
                      </div>
                    </dl>
                    <Button
                      className="min-h-11 w-full"
                      aria-label={`Review ${row.requirement.name} from ${row.employee.user.username}`}
                      onClick={() => setReview(row)}
                    >
                      Review
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <EmptyState>No submissions are waiting for review.</EmptyState>
        )}
      </Card>

      <ReviewDialog
        target={review}
        getReqFromDashboard={() => {
          queryClient.invalidateQueries({ queryKey: ["requirements"] }); //triggers a refresh
        }}
        onClose={() => setReview(null)}
      />
    </>
  );
}
