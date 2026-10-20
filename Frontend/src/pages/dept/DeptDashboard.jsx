import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Users } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import AutoGrid from "../../components/ui/AutoGrid";
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
    return <p>Loading...</p>;
  }
  if (depEmployeesError) {
    return <p>Failed loading department employees.</p>;
  }
  if (depRequirementsError) {
    return <p>Failed loading department requirements.</p>;
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
  const training = activityStat("dept-training");

  return (
    <>
      <AutoGrid min={190} gap="gap-4">
        <StatCard
          label="Employees in department"
          value={depEmployees.length}
          note={scope.department}
          icon={Users}
        />
        <StatCard
          label="Pending confirmations"
          value={pending.length}
          note="Activities awaiting you"
          // Amber only while something is actually waiting.
          tone={pending.length > 0 ? "warning" : "neutral"}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Orientation done"
          value={orientation.value}
          note="Company orientation"
          tone={orientation.tone}
        />
        <StatCard
          label="Training done"
          value={training.value}
          note="One-month training"
          tone={training.tone}
        />
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Activities awaiting your confirmation</h4>
          <Button
            className="ml-auto"
            onClick={() => navigate("/dept/requirements")}
          >
            Department requirements
          </Button>
        </div>

        {depEmployees.length ? (
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
                ? "Loading..."
                : depRequirements
                    .filter(
                      (depReq) =>
                        depReq.status === "in-progress" &&
                        depReq.employee.onboardingStatus === "in_progress",
                    )
                    .map((req) => (
                      <TRow key={req._id}>
                        <TCell strong>{req.employee.user.username}</TCell>
                        <TCell>{req.employee.position}</TCell>
                        <TCell>{req.requirement.name}</TCell>
                        <TCell>{formatDate(req.dueDate)}</TCell>
                        <TCell>
                          <Badge
                            variant={
                              req.status === "in-progress" ||
                              req.status === "resubmission-required"
                                ? "in-progress"
                                : req.status === "completed"
                                  ? "completed"
                                  : req.status === "pending" && "in-progress"
                            }
                          >
                            {formatStatus(req.status)}
                          </Badge>
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
        ) : (
          <EmptyState>
            Nothing is waiting for confirmation in {scope.department}.
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
