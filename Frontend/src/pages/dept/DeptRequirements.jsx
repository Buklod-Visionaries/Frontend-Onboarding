import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/Notice";
import { Input, Segmented } from "../../components/ui/Field";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ConfirmActivityDialog from "../../components/feature/requirements/ConfirmActivityDialog";
import { useDepartmentScope } from "../../hooks/useDepartmentScope";
import { formatDate } from "../../domain/date";
//
import { useApp } from "../../hooks/useApp";
import api from "../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useDepEmpReq } from "../../hooks/useRequirements";
import { formatStatus } from "../../lib/formatter";

const ACTIVITIES = ["Orientation", "Department Training", "Team Introduction"];

/** Confirming an activity updates the onboarding record and notifies HR. */
export default function DeptRequirements() {
  // const scope = useDepartmentScope();
  const app = useApp();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  // View-only filters over the rows already loaded.
  const [search, setSearch] = useState("");
  // A dashboard card can deep-link an activity (?activity=…). The filter follows
  // the URL whenever that parameter changes, and can still be changed by hand.
  const [searchParams] = useSearchParams();
  const activityParam = searchParams.get("activity");
  const activityFromUrl = ACTIVITIES.includes(activityParam) ? activityParam : "All";
  const [activity, setActivity] = useState(activityFromUrl);
  const [syncedParam, setSyncedParam] = useState(activityParam);
  if (activityParam !== syncedParam) {
    setSyncedParam(activityParam);
    setActivity(activityFromUrl);
  }
  // const [depRequirements, setDepRequirements] = useState([]);

  //from depReq hook
  const {
    data: depRequirements = [],
    isLoading: depRequirementsLoading,
    isError: depRequirementsError,
  } = useDepEmpReq(app.session.accessToken);

  // Same base filter as before (activity + not deactivated), then the view
  // filters; table and cards share it so they always show the same rows.
  const query = search.trim().toLowerCase();
  const filtering = Boolean(query);
  const allRowsFor = (title) =>
    depRequirements.filter(
      (row) =>
        row.requirement.name === title &&
        row.employee.onboardingStatus !== "deactivated",
    );
  const rowsFor = (title) =>
    allRowsFor(title).filter(
      (row) =>
        !query || row.employee.user.username.toLowerCase().includes(query),
    );
  const visibleActivities = ACTIVITIES.filter(
    (title) => activity === "All" || activity === title,
  );
  const total = ACTIVITIES.reduce((n, title) => n + allRowsFor(title).length, 0);
  const shown = visibleActivities.reduce((n, title) => n + rowsFor(title).length, 0);

  if (depRequirementsError) {
    return <ErrorState>Failed loading department requirements.</ErrorState>;
  }

  return (
    <>
      {depRequirementsLoading ? (
        <LoadingState />
      ) : (
        <>
          <Card className="gap-4">
            <p className="m-0 text-cell text-ink/60">
              {/* Orientation, training and team introduction for {requirements.department}.
          Confirming an activity updates the employee&rsquo;s onboarding record
          and notifies HR. */}
            </p>

            {/* Phones: search + activity dropdown on one row.
                md and up: search + segmented activity filter. */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,10rem)] gap-2.5 md:flex md:flex-wrap md:items-center md:gap-3">
              <div className="relative min-w-0 md:max-w-[260px] md:flex-1">
                <Search
                  size={15}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/45 md:hidden"
                />
                <Input
                  className="max-md:min-h-11 max-md:pl-8"
                  placeholder="Search employee"
                  aria-label="Search employee"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Segmented
                collapse
                label="Filter by activity"
                value={activity}
                onChange={setActivity}
                options={["All", ...ACTIVITIES]}
              />
            </div>
            <p className="m-0 text-meta text-ink/55">
              Showing {shown} of {total} activity records
            </p>

            {shown === 0 && filtering ? (
              <EmptyState>No activities match these filters.</EmptyState>
            ) : (
            <>
            {/* lg and up: one table, grouped by activity. */}
            <div className="hidden lg:block">
              <Table>
                <THead
                  columns={[
                    "Employee",
                    "Activity",
                    "Target / detail",
                    "Status",
                    { label: "", align: "right" },
                  ]}
                />
                <tbody>
                  {visibleActivities.map((title) => {
                    const rows = rowsFor(title);
                    // While filtering, activities with no matches are skipped.
                    if (!rows.length && filtering) return null;
                    if (!rows.length) {
                      return (
                        <TRow key={title}>
                          <TCell muted>&mdash;</TCell>
                          <TCell strong>{title}</TCell>
                          <td colSpan={3} className="py-3 pr-0 text-field text-ink/55">
                            No employees for this activity.
                          </td>
                        </TRow>
                      );
                    }
                    return rows.map((row) => {
                      const done = row.requirement.status === "Completed";
                      return (
                        <TRow key={`${title}-${row._id ?? row.requirement._id}`}>
                          <TCell strong>{row.employee.user.username}</TCell>
                          <TCell>{title}</TCell>
                          <TCell muted>
                            {done
                              ? row.requirement.subLabel
                              : `Target ${formatDate(row.dueDate)}`}
                          </TCell>
                          <TCell>
                            <ActivityBadge status={row.status} />
                          </TCell>
                          <TCell align="right">
                            {row.status !== "completed" && (
                              <Button onClick={() => setConfirm(row)}>Confirm</Button>
                            )}
                          </TCell>
                        </TRow>
                      );
                    });
                  })}
                </tbody>
              </Table>
            </div>

            {/* Below lg: one record card per employee activity (two-up on
                tablets), same rows, badge and Confirm action as the table. */}
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
              {visibleActivities.flatMap((title) => {
                const rows = rowsFor(title);
                if (!rows.length) {
                  if (filtering) return [];
                  return [
                    <li
                      key={title}
                      className="flex flex-col gap-1 border border-dashed border-divider p-3.5"
                    >
                      <div className="text-field font-medium">{title}</div>
                      <div className="text-cell text-ink/55">No employees for this activity.</div>
                    </li>,
                  ];
                }
                return rows.map((row) => {
                  const done = row.requirement.status === "Completed";
                  return (
                    <li
                      key={`${title}-${row._id ?? row.requirement._id}`}
                      className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 break-words text-field font-medium">
                          {row.employee.user.username}
                        </div>
                        <span className="shrink-0">
                          <ActivityBadge status={row.status} />
                        </span>
                      </div>
                      <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                        <div className="min-w-0">
                          <dt className="text-micro uppercase text-ink/55">Activity</dt>
                          <dd className="m-0 break-words text-cell">{title}</dd>
                        </div>
                        <div className="min-w-0">
                          <dt className="text-micro uppercase text-ink/55">Target / detail</dt>
                          <dd className="m-0 break-words text-cell">
                            {done
                              ? row.requirement.subLabel
                              : `Target ${formatDate(row.dueDate)}`}
                          </dd>
                        </div>
                      </dl>
                      {row.status !== "completed" && (
                        <Button
                          className="mt-auto min-h-11 w-full"
                          aria-label={`Confirm ${title} for ${row.employee.user.username}`}
                          onClick={() => setConfirm(row)}
                        >
                          Confirm
                        </Button>
                      )}
                    </li>
                  );
                });
              })}
            </ul>
            </>
            )}
          </Card>

          <ConfirmActivityDialog
            target={confirm}
            setConfirmLoading={setConfirmLoading}
            setDepRequirements={() => {
              queryClient.invalidateQueries({ queryKey: ["depRequirements"] });
            }}
            onClose={() => setConfirm(null)}
          />
        </>
      )}
    </>
  );
}

/** Activity status badge (same variant mapping as before), shared by table and cards. */
function ActivityBadge({ status }) {
  return (
    <Badge
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
