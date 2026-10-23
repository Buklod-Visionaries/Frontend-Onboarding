import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { Input, Segmented } from "../../components/ui/Field";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Notice";
import { useApp } from "../../hooks/useApp";
import { formatDate } from "../../domain/date";
import { DEPARTMENTS } from "../../domain/constants";
//
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees } from "../../hooks/useEmployees";
import { useRequirements } from "../../hooks/useRequirements";
import { capitalize } from "../../lib/capitalize";

export default function EmployeeList() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  // Search and department live in the URL (?q=, ?department=), so they are
  // still applied when coming back from a profile.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const departmentParam = searchParams.get("department");
  //pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  //
  const department = DEPARTMENTS.some((d) => d.value === departmentParam)
    ? departmentParam
    : "All";
  const setParam = (key, value, empty) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== empty) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  const setSearch = (value) => setParam("q", value, "");
  const setDepartment = (value) => setParam("department", value, "All");
  const openProfile = (employee) =>
    navigate(`/hr/employees/${employee._id}`, {
      state: { listSearch: location.search },
    });
  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
  } = useEmployees(app.session.accessToken);
  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    isError: requirementsError,
  } = useRequirements(app.session.accessToken);

  const query = search.trim().toLowerCase();
  const rows = employees.filter((employee) => {
    const byDepartment =
      department === "All" || employee.user.department === department;
    const byQuery =
      !query ||
      employee.user.username.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query);
    return byDepartment && byQuery;
  });

  // Reset to page 1 when search or department filter changes
  useEffect(() => {
    setPage(1);
  }, [search, department]);

  // Pagination calculations (after filtering)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const startIndex = (page - 1) * pageSize;

  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const showing = `Showing ${
    rows.length === 0 ? 0 : startIndex + 1
  }–${Math.min(startIndex + pageSize, rows.length)} of ${
    rows.length
  } matching employees`;

  if (employeesLoading || requirementsLoading) {
    return <LoadingState />;
  }

  if (employeesError) {
    return <ErrorState>Failed loading employees.</ErrorState>;
  }
  if (requirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }

  /** Same completed/total calculation as before, computed once per employee. */
  const progressOf = (employee) => {
    const mine = requirements.filter(
      (req) => req.employee._id === employee._id,
    );
    const done = mine.filter((req) => req.status === "completed").length;
    return { done, total: mine.length, value: (done / mine.length) * 100 };
  };

  return (
    <Card className="gap-4">
      {/* Phones: search + department dropdown on one row, Add employee below.
          md and up: the original row (search, segmented filter, Add employee). */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,9.5rem)] gap-2.5 md:flex md:flex-wrap md:items-center md:gap-3">
        <div className="relative min-w-0 md:max-w-[280px] md:flex-1">
          <Search
            size={15}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/45 md:hidden"
          />
          <Input
            className="max-md:min-h-11 max-md:pl-8"
            placeholder="Search employee or position"
            aria-label="Search employee or position"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Segmented
          collapse
          label="Filter by department"
          value={department}
          onChange={setDepartment}
          options={["All", ...DEPARTMENTS]}
        />
        <Button
          variant="primary"
          className="col-span-2 min-h-11 w-full md:ml-auto md:min-h-0 md:w-auto"
          onClick={() => navigate("/hr/employees/new")}
        >
          Add employee
        </Button>
      </div>

      {rows.length ? (
        <>
          {/* lg and up: the existing table. */}
          <div className="hidden lg:block">
            <Table>
              <THead
                columns={[
                  "Employee",
                  "Position",
                  "Department",
                  "Start date",
                  "Progress",
                  "Status",
                  { label: "", align: "right" },
                ]}
              />
              <tbody>
                {paginatedRows.map((employee) => {
                  const progress = progressOf(employee);
                  return (
                    <TRow key={employee._id}>
                      <TCell strong>{employee.user.username}</TCell>
                      <TCell>{capitalize(employee.position)}</TCell>
                      <TCell>{capitalize(employee.department)}</TCell>
                      <TCell>{formatDate(employee.startDate)}</TCell>
                      <TCell className="min-w-[160px]">
                        <ProgressCell progress={progress} />
                      </TCell>
                      <TCell>
                        <OnboardingBadge status={employee.onboardingStatus} />
                      </TCell>
                      <TCell align="right">
                        <Button onClick={() => openProfile(employee)}>
                          View profile
                        </Button>
                      </TCell>
                    </TRow>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Below lg: one card per employee (two-up on tablets), same rows and Open action. */}
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
            {paginatedRows.map((employee) => (
              <li
                key={employee._id}
                className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="break-words text-field font-medium">
                      {employee.user.username}
                    </div>
                    <div className="break-words text-cell text-ink/65">
                      {capitalize(employee.position)}
                    </div>
                  </div>
                  <OnboardingBadge
                    status={employee.onboardingStatus}
                    className="shrink-0"
                  />
                </div>
                <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                  <div className="min-w-0">
                    <dt className="text-micro uppercase text-ink/55">
                      Department
                    </dt>
                    <dd className="m-0 break-words text-cell">
                      {capitalize(employee.department)}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-micro uppercase text-ink/55">
                      Start date
                    </dt>
                    <dd className="m-0 text-cell">
                      {formatDate(employee.startDate)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-micro uppercase text-ink/55">
                      Progress
                    </dt>
                    <dd className="m-0 mt-1">
                      <ProgressCell progress={progressOf(employee)} />
                    </dd>
                  </div>
                </dl>
                <Button
                  className="mt-auto min-h-11 w-full"
                  aria-label={`View profile of ${employee.user.username}`}
                  onClick={() => openProfile(employee)}
                >
                  View profile
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState>
          No employees match this search and department. Try a different name or
          position, or choose &ldquo;All&rdquo;.
        </EmptyState>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-meta text-ink/50">
          <span>{showing}</span>
          <span>{employees.length} total employee records</span>
        </div>

        <div className="flex items-center gap-2 max-md:w-full max-md:justify-between">
          <Button
            aria-label="Previous page"
            className="max-md:min-h-11 max-md:min-w-11"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" className="md:hidden" />
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
            <ChevronRight size={16} aria-hidden="true" className="md:hidden" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Progress bar + done/total, shared by the table and the cards. */
function ProgressCell({ progress }) {
  return (
    <div className="flex items-center gap-2.5">
      <ProgressBar
        height="sm"
        value={progress.value}
        className="min-w-[80px] flex-1"
      />
      <span className="text-meta tabular-nums text-ink/60">
        {progress.done}/{progress.total}
      </span>
    </div>
  );
}

/** Onboarding status badge, shared by the table and the cards. */
function OnboardingBadge({ status, className }) {
  return (
    <Badge
      className={className}
      variant={
        status === "in_progress"
          ? "in-progress"
          : status === "completed"
            ? "completed"
            : status === "deactivated" && "deactivated"
      }
    >
      {status === "in_progress"
        ? "In Progress"
        : status === "completed"
          ? "Completed"
          : status === "deactivated" && "Deactivated"}
    </Badge>
  );
}
