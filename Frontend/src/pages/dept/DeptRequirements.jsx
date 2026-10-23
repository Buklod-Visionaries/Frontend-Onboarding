import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/Notice";
import { Input, Segmented } from "../../components/ui/Field";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const activityFromUrl = ACTIVITIES.includes(activityParam)
    ? activityParam
    : "All";
  const [activity, setActivity] = useState(activityFromUrl);
  const [syncedParam, setSyncedParam] = useState(activityParam);
  if (activityParam !== syncedParam) {
    setSyncedParam(activityParam);
    setActivity(activityFromUrl);
  }
  //pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
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
  const total = ACTIVITIES.reduce(
    (n, title) => n + allRowsFor(title).length,
    0,
  );
  const shown = visibleActivities.reduce(
    (n, title) => n + rowsFor(title).length,
    0,
  );

  // Combine all visible activities into one filtered list
  const rows = visibleActivities.flatMap((title) =>
    rowsFor(title).map((row) => ({
      ...row,
      activityTitle: title,
    })),
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = (page - 1) * pageSize;

  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const showing = `Showing ${
    rows.length === 0 ? 0 : startIndex + 1
  }–${Math.min(startIndex + pageSize, rows.length)} of ${
    rows.length
  } activity records`;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, activity]);

  // Keep the current page valid when records are removed
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

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
                      {paginatedRows.map((row) => {
                        const done = row.status === "completed";

                        return (
                          <TRow key={row._id}>
                            <TCell strong>{row.employee.user.username}</TCell>
                            <TCell>{row.activityTitle}</TCell>
                            <TCell muted>
                              {done
                                ? `Completed ${formatDate(row.dueDate)}`
                                : `Target ${formatDate(row.dueDate)}`}
                            </TCell>
                            <TCell>
                              <ActivityBadge status={row.status} />
                            </TCell>
                            <TCell align="right">
                              {row.status !== "completed" && (
                                <Button onClick={() => setConfirm(row)}>
                                  Confirm
                                </Button>
                              )}
                            </TCell>
                          </TRow>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                {/* Below lg: one record card per employee activity (two-up on
                tablets), same rows, badge and Confirm action as the table. */}
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
                  {paginatedRows.map((row) => {
                    const done = row.status === "completed";

                    return (
                      <li
                        key={row._id}
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
                            <dt className="text-micro uppercase text-ink/55">
                              Activity
                            </dt>
                            <dd className="m-0 break-words text-cell">
                              {row.activityTitle}
                            </dd>
                          </div>

                          <div className="min-w-0">
                            <dt className="text-micro uppercase text-ink/55">
                              Target / detail
                            </dt>
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
                            aria-label={`Confirm ${row.activityTitle} for ${row.employee.user.username}`}
                            onClick={() => setConfirm(row)}
                          >
                            Confirm
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-meta text-ink/50">
                <span>{showing}</span>
              </div>

              <div className="flex items-center gap-2 max-md:w-full max-md:justify-between">
                <Button
                  aria-label="Previous page"
                  className="max-md:min-h-11 max-md:min-w-11"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                    className="md:hidden"
                  />
                  <span className="max-md:hidden">Previous</span>
                </Button>

                <span className="whitespace-nowrap text-meta text-ink/70">
                  Page {page} of {totalPages}
                </span>

                <Button
                  aria-label="Next page"
                  className="max-md:min-h-11 max-md:min-w-11"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <span className="max-md:hidden">Next</span>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="md:hidden"
                  />
                </Button>
              </div>
            </div>
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
