import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ReviewDialog from "../../components/feature/requirements/ReviewDialog";
import { useApp } from "../../hooks/useApp";
import { formatDate, isOverdue } from "../../domain/date";
//
import { formatStatus } from "../../lib/formatter";
import { useQueryClient } from "@tanstack/react-query";
import { useSpecificEmployee } from "../../hooks/useEmployees";
import { useSpecificEmployeeRequirements } from "../../hooks/useRequirements";
import { useCreateNotif } from "../../hooks/useNotifications";
import { capitalize } from "../../lib/capitalize";

/** Employee record, scoped to onboarding requirements. */
export default function EmployeeProfile() {
  const app = useApp();
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  //from employee hook
  const {
    data: employee = [],
    isLoading: employeeLoading,
    isError: employeeError,
  } = useSpecificEmployee(app.session.accessToken, params.id);
  //from empReq hook
  const {
    data: empRequirements = [],
    isLoading: empRequirementsLoading,
    isError: empRequirementsError,
  } = useSpecificEmployeeRequirements(app.session.accessToken, params.id);

  //notif mutation
  const createNotifMutation = useCreateNotif(app.session.accessToken);

  ////
  if (employeeLoading || empRequirementsLoading) {
    return <p>Loading...</p>;
  }

  if (employeeError) {
    return <p>Failed loading employee.</p>;
  }
  if (empRequirementsError) {
    return <p>Failed loading requirements.</p>;
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

  //reminder message creation NOT USED
  // const inProgressCount = empRequirements.filter(
  //   (req) => req.status === "in-progress" && req.type === "document",
  // ).length;
  // const overdueCount = empRequirements.filter(
  //   (req) =>
  //     (req.status === "in-progress" ||
  //       (req.status === "resubmission-required" && req.type === "document")) &&
  //     isOverdue(formatDate(req.dueDate)),
  // ).length;
  // const resubmissionRequiredCount = empRequirements.filter(
  //   (req) => req.status === "resubmission-required" && req.type === "document",
  // ).length;

  // const parts = [];
  // if (inProgressCount > 0) {
  //   parts.push(
  //     `${inProgressCount} in progress requirement${inProgressCount > 1 ? "s" : ""}`,
  //   );
  // }
  // if (overdueCount > 0) {
  //   parts.push(
  //     `${overdueCount} overdue requirement${overdueCount > 1 ? "s" : ""}`,
  //   );
  // }
  // if (resubmissionRequiredCount > 0) {
  //   parts.push(
  //     `${resubmissionRequiredCount} resubmission required requirement${resubmissionRequiredCount > 1 ? "s" : ""}`,
  //   );
  // }

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
                Started {formatDate(employee.startDate)} &middot;{" "}
                {
                  empRequirements.filter(
                    (req) =>
                      req.employee._id === employee._id &&
                      req.status === "completed",
                  ).length
                }
                /
                {
                  empRequirements.filter(
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
            <Button
              onClick={async () => {
                try {
                  await createNotifMutation.mutateAsync({
                    user: employee.user._id,
                    title: "Onboarding Requirements Reminder",
                    message:
                      "You have onboarding requirements that need your attention. Please review your requirements and submit any in progress documents or resubmit documents that require changes",
                  }); //user, title, message
                  app.showToast(`Reminder sent to ${employee.user.username}`);
                } catch (error) {
                  console.log("Failed sending notif", error);
                }
              }}
              disabled={
                //disabled if all req are completed
                empRequirements.filter(
                  (req) =>
                    req.status === "in-progress" ||
                    req.status === "resubmission-required",
                ).length === 0
              }
            >
              Send reminder
            </Button>
          </div>
        </div>

        <ProgressBar
          value={
            (empRequirements.filter(
              (req) =>
                req.employee._id === employee._id && req.status === "completed",
            ).length /
              empRequirements.filter((req) => req.employee._id === employee._id)
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
            {empRequirements.map((req) => {
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
                    {req.status !== "completed" &&
                      isOverdue(formatDate(req.dueDate)) && (
                        <OverdueBadge
                          when={isOverdue(formatDate(req.dueDate))}
                        />
                      )}
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

      <ReviewDialog
        target={review}
        getReqFromEmpProfile={() =>
          queryClient.invalidateQueries({
            queryKey: ["empRequirements", params.id],
          })
        }
        onClose={() => setReview(null)}
      />
    </>
  );
}
