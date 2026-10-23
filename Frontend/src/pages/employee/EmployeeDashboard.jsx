import { useNavigate } from "react-router-dom";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { CircleAlert, CircleCheckBig } from "lucide-react";
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
import { formatDate, formatRelativeDate, isOverdue } from "../../domain/date";
//
import { OverdueBadge } from "../../components/ui/Badge";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentEmployee } from "../../hooks/useEmployees.js";
import { useMyRequirements } from "../../hooks/useRequirements.js";
import { useAllOwnNotif } from "../../hooks/useNotifications.js";
import { capitalize } from "../../lib/capitalize.js";
import { formatStatus } from "../../lib/formatter.js";

export default function EmployeeDashboard() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  //from currentUser hook
  const {
    data: currentUser = [],
    isLoading: currentUserLoading,
    isError: currentUserError,
  } = useCurrentEmployee(app.session.accessToken);
  //from myReq hook
  const {
    data: myRequirements = [],
    isLoading: myRequirementsLoading,
    isError: myRequirementsError,
  } = useMyRequirements(app.session.accessToken);
  //from notif Hook
  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useAllOwnNotif(app.session.accessToken, 5);

  const actionable = myRequirements
    .filter((requirement) => requirement.status !== "completed")
    .slice(0, 7);

  // const notifications = app.notifications
  //   .filter((notification) => notification.to === "Employee")
  //   .slice(0, 3);

  //avoid rendering when currentUser is not yet fetched
  if (currentUserLoading || myRequirementsLoading || notificationsLoading) {
    return <LoadingState />;
  }

  if (currentUserError) {
    return <ErrorState>Failed loading current user.</ErrorState>;
  }
  if (myRequirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }
  const myOverdue = myRequirements.filter(
    (requirements) =>
      (requirements.status === "in-progress" ||
        requirements.status === "resubmission-required") &&
      isOverdue(formatDate(requirements.dueDate)),
  ).length;

  if (notificationsError) {
    return <ErrorState>Failed loading notifications.</ErrorState>;
  }

  let statusLabel;

  if (
    Math.round(
      (myRequirements.filter((req) => req.status === "completed").length /
        myRequirements.length) *
        100,
    ) === 100
  ) {
    statusLabel = (
      <div
        className={`flex flex-row justify-center items-center text-sm uppercase text-green-700`}
      >
        <CircleCheckBig size={15} className="mr-1" /> Fully Completed
      </div>
    );
  }
  if (
    Math.round(
      (myRequirements.filter((req) => req.status === "completed").length /
        myRequirements.length) *
        100,
    ) < 100 &&
    myRequirements.filter((req) => isOverdue(formatDate(req.dueDate)))
      .length === 0
  ) {
    statusLabel = (
      <div
        className={`flex flex-row justify-center items-center text-sm uppercase text-accent-700`}
      >
        Making Progress
      </div>
    );
  }
  if (
    Math.round(
      (myRequirements.filter((req) => req.status === "completed").length /
        myRequirements.length) *
        100,
    ) < 100 &&
    myRequirements.filter((req) => isOverdue(formatDate(req.dueDate))).length >
      0
  ) {
    statusLabel = (
      <div
        className={`flex flex-row justify-center items-center text-sm uppercase text-red-700`}
      >
        <CircleAlert size={15} className="mr-1" /> Action Required
      </div>
    );
  }

  return (
    <>
      <>
        <Card padding="lg" className="gap-4">
          <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
            <div className="min-w-0">
              <div className="text-micro uppercase text-accent-700">
                Overall onboarding progress
              </div>
              <h2 className="mt-1.5 break-words text-[26px] sm:text-[34px]">
                {currentUser.user.username}
              </h2>
              <div className="text-cell text-ink/55">
                {capitalize(currentUser.position)} &middot;{" "}
                {capitalize(currentUser.department)} &middot; Started{" "}
                {formatDate(currentUser.user.createdAt)}
              </div>
            </div>
            <div className="flex flex-col items-end justify-end font-heading text-[44px] leading-none sm:text-[56px]">
              <div>
                {myRequirements.length
                  ? Math.round(
                      (myRequirements.filter(
                        (req) => req.status === "completed",
                      ).length /
                        myRequirements.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              {statusLabel}
            </div>
          </div>
          <ProgressBar
            value={
              myRequirements.length
                ? Math.round(
                    (myRequirements.filter((req) => req.status === "completed")
                      .length /
                      myRequirements.length) *
                      100,
                  )
                : 0
            }
            height="lg"
          />
          {myRequirementsLoading ? (
            <LoadingState />
          ) : (
            <StatStrip
              min={140}
              items={[
                {
                  label: "Completed",
                  to: "/employee/requirements?status=completed",
                  value: myRequirements.filter(
                    (requirements) => requirements.status === "completed",
                  ).length,
                  tone: "success",
                },
                {
                  label: "In progress",
                  to: "/employee/requirements?status=in-progress",
                  value: myRequirements.filter(
                    (requirements) => requirements.status === "in-progress",
                  ).length,
                  tone: "warning",
                },
                {
                  label: "Pending",
                  to: "/employee/requirements?status=pending",
                  value: myRequirements.filter(
                    (requirements) => requirements.status === "pending",
                  ).length,
                  tone: "warning",
                },
                {
                  label: "Overdue",
                  to: "/employee/requirements",
                  value: myOverdue,
                  // Red only when something is actually overdue.
                  tone: myOverdue > 0 ? "danger" : "neutral",
                  icon: CircleAlert,
                },
              ]}
            />
          )}
        </Card>

        <AutoGrid min={320}>
          {myRequirementsLoading ? (
            <LoadingState />
          ) : (
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
              {/* Rows and the empty check use the same list, so pending-only
                  requirements show the empty message instead of a blank list. */}
              {actionable.some(
                (requirement) => requirement.status !== "pending",
              ) ? (
                <DividerList>
                  {actionable
                    .filter(
                      (requirement) =>
                        requirement.status !== "completed" &&
                        requirement.status !== "pending",
                    )
                    .map((requirement) => (
                      <DividerRow
                        key={requirement._id}
                        as="button"
                        type="button"
                        onClick={() =>
                          navigate(`/employee/requirements/${requirement._id}`)
                        }
                        className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-accent-100"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block break-words text-field font-medium">
                            {requirement.requirement.name}
                          </span>
                          {/* Same sub-label text as before, without block elements inside the button. */}
                          <span className="block text-meta text-ink/55">
                            {requirement.status === "in-progress"
                              ? "Not yet submitted · "
                              : requirement.status === "resubmission-required"
                                ? "Resubmission requested · "
                                : ""}
                            due {formatDate(requirement.dueDate)}
                          </span>
                        </span>
                        <Badge
                          variant={
                            requirement.status === "in-progress" ||
                            requirement.status === "resubmission-required"
                              ? "in-progress"
                              : requirement.status === "completed"
                                ? "completed"
                                : requirement.status === "pending" &&
                                  "in-progress"
                          }
                        >
                          {formatStatus(requirement.status)}
                        </Badge>{" "}
                        <OverdueBadge
                          when={
                            isOverdue(formatDate(requirement.dueDate)) &&
                            requirement.status !== "completed"
                          }
                        />
                      </DividerRow>
                    ))}
                </DividerList>
              ) : (
                <EmptyState className="h-full flex justify-center items-center">
                  Nothing needs your action right now.
                </EmptyState>
              )}
            </Card>
          )}

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
                    key={notification._id}
                    className="grid gap-3"
                    style={{ gridTemplateColumns: "8px 1fr" }}
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        "mt-1.5 h-[7px] w-[7px] rounded-full",
                        !notification.isRead ? "bg-accent" : "bg-neutral-400",
                      )}
                    />
                    <div>
                      <div className="text-field font-medium">
                        {!notification.isRead && (
                          <span className="sr-only">Unread: </span>
                        )}
                        {notification.title}
                      </div>
                      <div className="text-cell text-ink/60 line-clamp-1">
                        {notification.message}
                      </div>
                      <div className="mt-0.5 text-[11px] text-ink/45">
                        {formatRelativeDate(notification.createdAt)}
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
