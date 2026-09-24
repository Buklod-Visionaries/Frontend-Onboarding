import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import AutoGrid from "../../components/ui/AutoGrid";
import { EventList } from "../../components/ui/Timeline";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Notice";
import ReviewDialog from "../../components/feature/requirements/ReviewDialog";
import { useApp } from "../../hooks/useApp";
import { useVerificationQueue } from "../../hooks/useVerificationQueue";
import { countRequirements } from "../../domain/requirements";
import { employeeStatus } from "../../domain/employees";
import { formatDate, isOverdue } from "../../domain/date";
//
import { capitalize } from "../../lib/capitalize";
import api from "../../lib/axios";

export default function HrDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  const queue = useVerificationQueue();
  const [review, setReview] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);

  useEffect(() => {
    async function getAllRequirements() {
      try {
        setReqLoading(true);
        const res = await api.get("/employee-requirements", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setRequirements(res.data);
      } catch (error) {
        app.showToast(`Error: ${error.response.data.message}`);
      } finally {
        setReqLoading(false);
      }
    }

    async function getAllEmployees() {
      try {
        setEmpLoading(true);
        const res = await api.get("/employees", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setEmployees(res.data);
      } catch (error) {
        app.showToast(`Error: ${error.response.data.message}`);
      } finally {
        setEmpLoading(false);
      }
    }
    getAllRequirements();
    getAllEmployees();
  }, []);

  if (empLoading || reqLoading) {
    return <p>Loading...</p>;
  }

  console.log("review", review);

  return (
    <>
      <AutoGrid min={190} gap="gap-4">
        <StatCard
          label="Total employees"
          value={employees.length}
          note="Onboarding records on file"
        />
        <StatCard
          label="In progress"
          value={
            requirements.filter((req) => req.status === "in-progress").length
          }
          note="Onboarding not yet complete"
        />
        <StatCard
          label="Pending requirements"
          value={requirements.filter((req) => req.status === "pending").length}
          note="Not yet submitted"
        />
        <StatCard
          label="Overdue"
          value={
            requirements.filter(
              (req) =>
                (req.status === "in-progress" ||
                  req.status === "resubmission-required") &&
                isOverdue(formatDate(req.dueDate)),
            ).length
          }
          note="Past deadline"
        />
        <StatCard
          label="Completed" // is the completed referring to employees onboarding itself?
          value={employees.filter((emp) => emp.status === "completed").length}
          note="Fully onboarded"
        />
      </AutoGrid>

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
          {requirements.length ? (
            <div className="flex flex-col">
              {employees
                .filter(
                  (employee) => employee.onboardingStatus === "in_progress",
                )
                .map((employee) => {
                  return (
                    <button
                      key={employee._id}
                      type="button"
                      onClick={() => navigate(`/hr/employees/${employee._id}`)}
                      className="grid items-center gap-x-3 gap-y-1 border-b border-ink/[0.08] px-2 py-3 text-left last:border-0 hover:bg-ink/[0.03]"
                      style={{ gridTemplateColumns: "1fr auto" }}
                    >
                      <span className="text-field font-medium">
                        {employee.user.username}
                      </span>

                      <Badge
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
                      <span className="text-meta text-ink/55">
                        {
                          requirements.filter(
                            (req) =>
                              req.employee._id === employee._id &&
                              isOverdue(formatDate(req.dueDate)),
                          ).length
                        }{" "}
                        overdue ·{" "}
                        {
                          requirements.filter(
                            (req) =>
                              req.employee._id === employee._id &&
                              req.status === "pending",
                          ).length
                        }{" "}
                        pending
                      </span>

                      <span className="text-[11px] text-ink/45">
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
          <EventList items={app.activity.slice(0, 6)} round />
        </Card>
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Awaiting verification</h4>
          <span className="text-meta text-ink/55">
            {requirements.filter((req) => req.status === "pending").length}{" "}
            {queue.filter((req) => req.status === "pending") === 1
              ? "submission"
              : "submissions"}{" "}
            in queue
          </span>
          <Button
            className="ml-auto"
            onClick={() => navigate("/hr/requirements")}
          >
            Open verification queue
          </Button>
        </div>
        {requirements.length ? (
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
              {requirements
                .filter((req) => req.status === "pending")
                .map((row) => (
                  <TRow key={row.requirement.id}>
                    <TCell strong>{row.employee.user.username}</TCell>
                    <TCell>{row.requirement.name}</TCell>
                    <TCell>{formatDate(row.updatedAt)}</TCell>
                    <TCell>{formatDate(row.dueDate)}</TCell>
                    <TCell align="right">
                      <Button onClick={() => setReview(row)}>Review</Button>
                    </TCell>
                  </TRow>
                ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No submissions are waiting for review.</EmptyState>
        )}
      </Card>

      <ReviewDialog target={review} onClose={() => setReview(null)} />
    </>
  );
}
