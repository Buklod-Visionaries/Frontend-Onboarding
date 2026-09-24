import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ReviewDialog from "../../components/feature/requirements/ReviewDialog";
import { useApp } from "../../hooks/useApp";
import {
  countRequirements,
  isAwaitingVerification,
  isOverdue,
} from "../../domain/requirements";
import { employeeStatus } from "../../domain/employees";
import { formatDate } from "../../domain/date";
//
import { formatStatus } from "../../lib/formatter";
import api from "../../lib/axios";
import { capitalize } from "../../lib/capitalize";

/** Employee record, scoped to onboarding requirements. */
export default function EmployeeProfile() {
  const app = useApp();
  const params = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);

  async function getSpecificEmployee() {
    try {
      setEmpLoading(true);
      const res = await api.get(`/employees/${params.id}`, {
        headers: {
          Authorization: `Bearer ${app.session.accessToken}`,
        },
      });
      setEmployee(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    } finally {
      setEmpLoading(false);
    }
  }

  async function getEmployeeRequirements() {
    try {
      setReqLoading(true);
      const res = await api.get(
        `/employee-requirements/employee/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        },
      );
      setRequirements(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    } finally {
      setReqLoading(false);
    }
  }

  useEffect(() => {
    getSpecificEmployee();
    getEmployeeRequirements();
  }, []);

  if (empLoading || reqLoading) {
    return <p>Loading...</p>;
  }

  if (!employee) {
    return (
      <Card>
        <p className="m-0 text-field">That employee record does not exist.</p>
        <Button
          className="mt-3 self-start"
          onClick={() => navigate("/hr/employees")}
        >
          Back to list
        </Button>
      </Card>
    );
  }

  // const counts = countRequirements(employee);

  return (
    <>
      <Card padding="lg" className="gap-4.5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-[240px] flex-1">
            <div className="text-micro uppercase text-accent-700">
              {employee.department} &middot; {employee.position}
            </div>
            <h2 className="mb-1.5 mt-1 text-[34px]">
              {employee.user.username}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={"in-progress"}>
                {formatStatus(employee.onboardingStatus)}
              </Badge>
              <span className="text-meta text-ink/55">
                Started {formatDate(employee.start)} &middot;{" "}
                {
                  requirements.filter(
                    (req) =>
                      req.employee._id === employee._id &&
                      req.status === "completed",
                  ).length
                }
                /
                {
                  requirements.filter(
                    (req) => req.employee._id === employee._id,
                  ).length
                }{" "}
                requirements completed
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => navigate("/hr/employees")}>
              Back to list
            </Button>
            <Button onClick={() => app.sendReminder(employee)}>
              Send reminder
            </Button>
          </div>
        </div>

        <ProgressBar
          value={
            (requirements.filter(
              (req) =>
                req.employee._id === employee._id && req.status === "completed",
            ).length /
              requirements.filter((req) => req.employee._id === employee._id)
                .length) *
            100
          }
          height="md"
        />

        <Table>
          <THead
            columns={[
              "Requirement",
              "Type",
              "Owner",
              "Deadline",
              "Status",
              { label: "", align: "right" },
            ]}
          />
          <tbody>
            {requirements.map((req) => {
              return (
                <TRow key={req._id}>
                  <TCell>
                    <div className="font-medium">{req.requirement.name}</div>
                    <div className="text-[11px] text-ink/50">
                      {req.subLabel}
                    </div>
                  </TCell>
                  <TCell>{capitalize(req.requirement.type)}</TCell>
                  <TCell>
                    {req.requirement.type === "activity"
                      ? "Department"
                      : capitalize(req.employee.user.role)}
                  </TCell>
                  <TCell>
                    <div>{formatDate(req.dueDate)}</div>
                    <OverdueBadge when={isOverdue(req.dueDate)} />
                  </TCell>
                  <TCell>
                    <Badge
                      variant={
                        req.status === "in-progress" ||
                        req.status === "resubmission-required"
                          ? "pending"
                          : req.status === "completed"
                            ? "completed"
                            : req.status === "pending" && "in-progress"
                      }
                    >
                      {formatStatus(req.status)}
                    </Badge>
                  </TCell>
                  <TCell align="right">
                    {(req.status === "pending" ||
                      req.status === "completed") && (
                      <Button onClick={() => setReview(req)}>
                        {req.status === "pending" ? "Review" : "View"}
                      </Button>
                    )}
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ReviewDialog target={review} onClose={() => setReview(null)} />
    </>
  );
}
