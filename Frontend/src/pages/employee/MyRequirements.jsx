import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { Segmented } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/Notice";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { STATUSES, SUB_LABELS } from "../../domain/constants";
import { formatDate, isOverdue } from "../../domain/date";
import { capitalize } from "../../lib/capitalize";
import { formatStatus } from "../../lib/formatter";
//
import { useApp } from "../../hooks/useApp";
import api from "../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useMyRequirements } from "../../hooks/useRequirements";

const FILTERS = ["All", ...STATUSES];
// Status values the filter below offers; a ?status= link must be one of them.
const STATUS_VALUES = [
  "in-progress",
  "pending",
  "completed",
  "resubmission-required",
];

export default function MyRequirements() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // A dashboard figure can deep-link a status (?status=…). The filter follows
  // the URL whenever that parameter changes, and can still be changed by hand.
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const statusParam = searchParams.get("status");
  const statusFromUrl = STATUS_VALUES.includes(statusParam)
    ? statusParam
    : "All";
  const [filter, setFilter] = useState(statusFromUrl);
  const [syncedParam, setSyncedParam] = useState(statusParam);
  if (statusParam !== syncedParam) {
    setSyncedParam(statusParam);
    setFilter(statusFromUrl);
  }
  const me = useCurrentEmployee();
  const {
    data: myRequirements = [],
    isLoading: myRequirementsLoading,
    isError: myRequirementsError,
  } = useMyRequirements(app.session.accessToken);

  const rows = myRequirements.filter(
    (requirement) => filter === "All" || requirement.status === filter,
  );

  if (myRequirementsLoading) {
    return <LoadingState />;
  }

  if (myRequirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }

  const open = (requirement) =>
    navigate(`/employee/requirements/${requirement._id}`, {
      state: { listSearch: location.search },
    });

  return (
    <Card className="gap-4">
      <Segmented
        collapse
        label="Filter by status"
        value={filter}
        onChange={(value) => {
          setFilter(value);
          // Kept in the URL so the filter survives opening a requirement.
          setSearchParams(value === "All" ? {} : { status: value }, {
            replace: true,
          });
        }}
        options={[
          { value: "All", label: "All" },
          { value: "in-progress", label: "In Progress" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
          { value: "resubmission-required", label: "Resubmission Required" },
        ]}
      />
      {rows.length ? (
        <>
          {/* lg and up: a table of requirements. */}
          <div className="hidden lg:block">
            <Table>
              <THead
                columns={[
                  "Requirement",
                  "Type",
                  "Deadline",
                  "Status",
                  { label: "", align: "right" },
                ]}
              />
              <tbody>
                {rows.map((requirement) => {
                  const view = viewOf(requirement);
                  return (
                    <TRow key={requirement._id}>
                      <TCell>
                        <div className="font-medium">
                          {requirement.requirement.name}
                        </div>
                        {view.sub && (
                          <div className="text-[11px] text-ink/55">
                            {view.sub}
                          </div>
                        )}
                      </TCell>
                      <TCell>{capitalize(requirement.requirement.type)}</TCell>
                      <TCell>
                        <Deadline requirement={requirement} />
                      </TCell>
                      <TCell>
                        <StatusBadge status={requirement.status} />
                      </TCell>
                      <TCell align="right">
                        {view.canOpen && (
                          <Button onClick={() => open(requirement)}>
                            {view.cta}
                          </Button>
                        )}
                      </TCell>
                    </TRow>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Below lg: one record card per requirement (two-up on tablets). */}
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
            {rows.map((requirement) => {
              const view = viewOf(requirement);
              return (
                <li
                  key={requirement._id}
                  className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="break-words text-field font-medium">
                        {requirement.requirement.name}
                      </div>
                      {view.sub && (
                        <div className="break-words text-[11px] text-ink/55">
                          {view.sub}
                        </div>
                      )}
                    </div>
                    <span className="shrink-0">
                      <StatusBadge status={requirement.status} />
                    </span>
                  </div>
                  <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div className="min-w-0">
                      <dt className="text-micro uppercase text-ink/55">Type</dt>
                      <dd className="m-0 text-cell">
                        {capitalize(requirement.requirement.type)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-micro uppercase text-ink/55">
                        Deadline
                      </dt>
                      <dd className="m-0 text-cell">
                        <Deadline requirement={requirement} view={view} />
                      </dd>
                    </div>
                  </dl>
                  {view.canOpen && (
                    <Button
                      className="mt-auto min-h-11 w-full"
                      aria-label={`${view.cta}: ${requirement.requirement.name}`}
                      onClick={() => open(requirement)}
                    >
                      {view.cta}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <EmptyState>
          No requirements with this status. Choose &ldquo;All&rdquo; to see
          every requirement.
        </EmptyState>
      )}
    </Card>
  );
}

/**
 * Presentation rules carried over from the former RequirementCard: the call to
 * action, the sub-label shown to employees, when the deadline shows, and that
 * only document requirements open the detail page.
 */
function viewOf(requirement) {
  const ownedByEmployee = requirement.employee.user.role === "employee";
  const cta =
    requirement.status === "completed"
      ? "View details"
      : ownedByEmployee
        ? requirement.status === "in-progress"
          ? "Upload document"
          : "View details"
        : "View details";
  const sub = ownedByEmployee
    ? requirement.subLabel
    : requirement.subLabel === SUB_LABELS.notSubmitted
      ? "Confirmed by your department representative"
      : requirement.subLabel;
  return {
    cta,
    sub,
    showDue:
      requirement.status !== "pending" && requirement.status !== "completed",
    canOpen: requirement.requirement.type === "document",
  };
}

/** Due date with the overdue label, or a dash once pending/completed (as before). */
function Deadline({ requirement }) {
  if (!requirement.dueDate) {
    return <span className="text-ink/45">—</span>;
  }

  const formattedDate = formatDate(requirement.dueDate);
  const overdue =
    requirement.status !== "completed" && isOverdue(formattedDate);

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className={overdue ? "font-medium text-red-800" : undefined}>
        {formattedDate}
      </span>
      <OverdueBadge when={overdue} />
    </span>
  );
}

/** Same status badge mapping the requirement card used. */
function StatusBadge({ status }) {
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
