import { useState } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/Notice";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ConfirmActivityDialog from "../../components/feature/requirements/ConfirmActivityDialog";
import { useDepartmentScope } from "../../hooks/useDepartmentScope";
import { formatDate } from "../../domain/date";
//
import { useApp } from "../../hooks/useApp";
import { useQueryClient } from "@tanstack/react-query";
import { useDepEmployees } from "../../hooks/useEmployees";
import { useDepEmpReq } from "../../hooks/useRequirements";
import { formatStatus } from "../../lib/formatter";

export default function DeptDashboard() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const scope = useDepartmentScope();
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  //fetch from depEmp hook
  const {
    data: depEmployees = [],
    isLoading: depEmployeesLoading,
    isError: depEmployeesError,
  } = useDepEmployees(app.session.accessToken);
  //from depReq hook
  const {
    data: depRequirements = [],
    isLoading: depRequirementsLoading,
    isError: depRequirementsError,
  } = useDepEmpReq(app.session.accessToken);

  const pending = depRequirements.filter((row) => row.status !== "completed");

  //
  if (depEmployeesLoading || depRequirementsLoading) {
    return <LoadingState />;
  }
  if (depEmployeesError) {
    return <ErrorState>Failed loading department employees.</ErrorState>;
  }
  if (depRequirementsError) {
    return <ErrorState>Failed loading department requirements.</ErrorState>;
  }

  /** done/total for one activity; green once every one is done, amber until then. */
  const activityStat = (activity) => {
    const rows = depRequirements.filter((e) => e.requirement.activity === activity);
    const done = rows.filter((e) => e.status === "completed").length;
    return {
      value: `${done}/${rows.length}`,
      tone: rows.length && done === rows.length ? "success" : "warning",
    };
  };
  const orientation = activityStat("orientation");
  // One list feeds the table and the cards (same filter as before).
  const awaitingConfirm = depRequirements.filter(
    (depReq) =>
      depReq.status === "in-progress" &&
      depReq.employee.onboardingStatus === "in_progress",
  );
  const training = activityStat("dept-training");

  return (
    <>
      {/* Two-up on phones; from md the original auto-fit columns (min 190px). */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard
          to="/dept/requirements"
          label="Employees in department"
          value={depEmployees.length}
          note={scope.department}
          icon={Users}
        />
        <StatCard
          to="/dept/requirements"
          label="Pending confirmations"
          value={pending.length}
          note="Activities awaiting you"
          // Amber only while something is actually waiting.
          tone={pending.length > 0 ? "warning" : "neutral"}
          icon={ClipboardCheck}
        />
        <StatCard
          to="/dept/requirements?activity=Orientation"
          label="Orientation done"
          value={orientation.value}
          note="Company orientation"
          tone={orientation.tone}
        />
        <StatCard
          to="/dept/requirements?activity=Department%20Training"
          label="Training done"
          value={training.value}
          note="One-month training"
          tone={training.tone}
        />
      </div>

      <Card className="gap-3.5">
        {/* Heading and button share the top row; on phones the heading wraps
            beside a compact "View all" label. */}
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <h4 className="min-w-0 text-[20px]">Activities awaiting your confirmation</h4>
          <Button
            className="shrink-0"
            aria-label="View all department requirements"
            onClick={() => navigate("/dept/requirements")}
          >
            <span className="sm:hidden">View all</span>
            <span className="max-sm:hidden">Department requirements</span>
          </Button>
        </div>

        {awaitingConfirm.length || confirmLoading ? (
          <>
            {/* lg and up: the existing table. */}
            <div className="hidden lg:block">
              <Table>
                <THead
                  columns={[
                    "Employee",
                    "Position",
                    "Activity",
                    "Target date",
                    "Status",
                    { label: "", align: "right" },
                  ]}
                />
                <tbody>
                  {confirmLoading
                    ? (
                        <tr>
                          <td colSpan={6}>
                            <LoadingState />
                          </td>
                        </tr>
                      )
                    : awaitingConfirm.map((req) => (
                        <TRow key={req._id}>
                          <TCell strong>{req.employee.user.username}</TCell>
                          <TCell>{req.employee.position}</TCell>
                          <TCell>{req.requirement.name}</TCell>
                          <TCell>{formatDate(req.dueDate)}</TCell>
                          <TCell>
                            <ActivityStatusBadge status={req.status} />
                          </TCell>
                          <TCell align="right">
                            {req.status !== "completed" && (
                              <Button
                                variant="primary"
                                onClick={() => setConfirm(req)}
                              >
                                Confirm
                              </Button>
                            )}
                          </TCell>
                        </TRow>
                      ))}
                </tbody>
              </Table>
            </div>

            {/* Below lg: one card per activity (two-up on tablets), same Confirm action. */}
            {confirmLoading ? (
              <LoadingState className="lg:hidden" />
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
                {awaitingConfirm.map((req) => (
                  <li
                    key={req._id}
                    className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="break-words text-field font-medium">
                          {req.employee.user.username}
                        </div>
                        <div className="break-words text-cell text-ink/65">
                          {req.employee.position}
                        </div>
                      </div>
                      <ActivityStatusBadge status={req.status} className="shrink-0" />
                    </div>
                    <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                      <div className="min-w-0">
                        <dt className="text-micro uppercase text-ink/55">Activity</dt>
                        <dd className="m-0 break-words text-cell">{req.requirement.name}</dd>
                      </div>
                      <div>
                        <dt className="text-micro uppercase text-ink/55">Target date</dt>
                        <dd className="m-0 text-cell">{formatDate(req.dueDate)}</dd>
                      </div>
                    </dl>
                    {req.status !== "completed" && (
                      <Button
                        variant="primary"
                        className="mt-auto min-h-11 w-full"
                        aria-label={`Confirm ${req.requirement.name} for ${req.employee.user.username}`}
                        onClick={() => setConfirm(req)}
                      >
                        Confirm
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <EmptyState>
            Nothing is waiting for your confirmation right now. New activities
            appear here once employees reach them.
          </EmptyState>
        )}
      </Card>

      <ConfirmActivityDialog
        target={confirm}
        setConfirmLoading={setConfirmLoading}
        setDepRequirements={() => {
          queryClient.invalidateQueries({
            queryKey: ["depRequirements"],
          });
        }}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

/** Activity status badge (same variant mapping as before), shared by table and cards. */
function ActivityStatusBadge({ status, className }) {
  return (
    <Badge
      className={className}
      variant={
        status === "in-progress" || status === "resubmission-required"
          ? "in-progress"
          : status === "completed"
            ? "completed"
            : status === "pending" && "in-progress"
      }
    >
      {formatStatus(status)}
    </Badge>
  );
}
