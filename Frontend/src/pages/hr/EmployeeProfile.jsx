import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { EmptyState } from "../../components/ui/Notice";
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
  const location = useLocation();
  // Back to the list with the search/filter it was opened from, if any.
  const backToList = () =>
    navigate(`/hr/employees${location.state?.listSearch ?? ""}`);
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
    return <LoadingState />;
  }

  if (employeeError) {
    return <ErrorState>Failed loading employee.</ErrorState>;
  }
  if (empRequirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }

  if (!employee) {
    return (
      <Card>
        <p className="m-0 text-field">That employee record does not exist.</p>
        <Button className="mt-3 self-start" onClick={backToList}>
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

  // Same completed/total calculation the progress bar has always used.
  const progressValue =
    (empRequirements.filter(
      (req) => req.employee._id === employee._id && req.status === "completed",
    ).length /
      empRequirements.filter((req) => req.employee._id === employee._id)
        .length) *
    100;
  const progressPercent = Number.isFinite(progressValue)
    ? Math.round(progressValue)
    : 0;
  // Same condition the Send reminder button has always used, named so the
  // hint below can say why it is unavailable.
  const hasOverdueOpen =
    empRequirements.filter(
      (req) =>
        isOverdue(formatDate(req.dueDate)) &&
        (req.status === "in-progress" ||
          req.status === "resubmission-required"),
    ).length > 0;
  const deactivated = employee.onboardingStatus === "deactivated";

  return (
    <>
      <Card padding="lg" className="gap-4.5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-0 flex-1 basis-[240px]">
            <div className="text-micro uppercase text-accent-700">
              {employee.department} &middot; {employee.position}
            </div>
            <h2 className="mb-1.5 mt-1 break-words text-[26px] sm:text-[34px]">
              {employee.user.username}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  employee.onboardingStatus === "in_progress"
                    ? "in-progress"
                    : employee.onboardingStatus === "completed"
                      ? "completed"
                      : "deactivated"
                }
              >
                {formatStatus(employee.onboardingStatus)}
              </Badge>
              <span className="text-meta text-ink/55">
                Started at {formatDate(employee.startDate)}{" "}
                {employee.onboardingStatus === "completed" ? (
                  <span className="mx-auto">{` · Completed at ${formatDate(employee.completedDate)}`}</span>
                ) : (
                  ""
                )}{" "}
                &middot;{" "}
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
          {/* Phones: the two actions share a full-width row. */}
          <div className="flex flex-wrap gap-2.5 max-sm:w-full max-sm:[&>button]:flex-1 sm:max-w-[300px] sm:justify-end">
            <Button onClick={backToList}>Back to list</Button>
            <Button
              onClick={async () => {
                try {
                  await createNotifMutation.mutateAsync({
                    user: employee.user._id,
                    title: "Onboarding Requirements Reminder",
                    message:
                      "You have onboarding requirements that need your attention. Please review your requirements and submit any in progress documents or resubmit documents that require changes",
                  }); //user, title, message
                  app.showToast(`Reminder sent to ${employee.user.username}`, {
                    type: "success",
                  });
                } catch (error) {
                  console.log("Failed sending notif", error);
                }
              }}
              disabled={
                //disabled if no requirements are overdue while in progress or resubmission required
                !hasOverdueOpen ||
                deactivated || //disabled if employee is deactivated
                createNotifMutation.isPending
              }
            >
              {createNotifMutation.isPending
                ? "Sending reminder..."
                : "Send reminder"}
            </Button>
            {(deactivated || !hasOverdueOpen) && (
              <p className="m-0 basis-full text-meta text-ink/55 sm:text-right">
                {deactivated
                  ? "Reminders are unavailable for deactivated employees."
                  : "Reminders are available when a requirement is overdue."}
              </p>
            )}
          </div>
        </div>

        {/* Bar plus the same value as a percentage (0% when nothing is assigned yet). */}
        <div className="flex items-center gap-3">
          <ProgressBar value={progressValue} height="md" className="flex-1" />
          <span
            className="shrink-0 font-heading text-[18px] font-semibold tabular-nums leading-none text-ink"
            aria-label={`${progressPercent}% of requirements completed`}
          >
            {progressPercent}%
          </span>
        </div>

        {empRequirements.length === 0 && (
          <EmptyState>
            No requirements are assigned to this employee yet.
          </EmptyState>
        )}

        {/* lg and up: the existing table. */}
        <div className={empRequirements.length ? "hidden lg:block" : "hidden"}>
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
                      <RequirementStatusBadge status={req.status} />
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
        </div>

        {/* Below lg: one card per requirement (two-up on tablets), same Review/View actions. */}
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
          {empRequirements.map((req) => {
            const overdue =
              req.status !== "completed" && isOverdue(formatDate(req.dueDate));
            return (
              <li
                key={req._id}
                className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="break-words text-field font-medium">
                      {req.requirement.name}
                    </div>
                    {req.subLabel && (
                      <div className="break-words text-[11px] text-ink/55">
                        {req.subLabel}
                      </div>
                    )}
                  </div>
                  <RequirementStatusBadge
                    status={req.status}
                    className="shrink-0"
                  />
                </div>
                <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <div className="min-w-0">
                    <dt className="text-micro uppercase text-ink/55">Type</dt>
                    <dd className="m-0 text-cell">
                      {capitalize(req.requirement.type)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-micro uppercase text-ink/55">Owner</dt>
                    <dd className="m-0 break-words text-cell">
                      {req.requirement.type === "activity"
                        ? "Department"
                        : capitalize(req.employee.user.role)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-micro uppercase text-ink/55">
                      Deadline
                    </dt>
                    <dd className="m-0 flex flex-wrap items-center gap-1.5 text-cell">
                      <span
                        className={
                          overdue ? "font-medium text-red-800" : undefined
                        }
                      >
                        {formatDate(req.dueDate)}
                      </span>
                      <OverdueBadge when={overdue} />
                    </dd>
                  </div>
                </dl>
                {(req.status === "pending" || req.status === "completed") && (
                  <Button
                    className="mt-auto min-h-11 w-full"
                    aria-label={`${req.status === "pending" ? "Review" : "View"} ${req.requirement.name}`}
                    onClick={() => setReview(req)}
                  >
                    {req.status === "pending" ? "Review" : "View"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
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

/** Requirement status badge (same variant mapping as before), shared by table and cards. */
function RequirementStatusBadge({ status, className }) {
  return (
    <Badge
      className={className}
      variant={
        status === "in-progress" || status === "resubmission-required"
          ? "pending"
          : status === "completed"
            ? "completed"
            : status === "pending" && "in-progress"
      }
    >
      {formatStatus(status)}
    </Badge>
  );
}
