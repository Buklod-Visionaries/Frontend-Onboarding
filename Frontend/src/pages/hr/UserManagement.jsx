import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import { Input, Segmented, Select } from "../../components/ui/Field";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Notice";
import CopyField from "../../components/ui/CopyField";
import CreateUserDialog from "../../components/feature/accounts/CreateUserDialog";
import ManageAccessDialog from "../../components/feature/accounts/ManageAccessDialog";
import AccountCreatedDialog from "../../components/feature/accounts/AccountCreatedDialog";
import { useApp } from "../../hooks/useApp";
import { EM_DASH, TEMP_PASSWORD } from "../../domain/constants";
//
import { formatRole } from "../../lib/formatter";
import { capitalize } from "../../lib/capitalize";
import { formatRelativeDate } from "../../domain/date";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "../../hooks/useUsers";

const FILTERS = [
  { value: "All", label: "All" },
  { value: "hr", label: "HR Staff" },
  { value: "employee", label: "Employee" },
  { value: "dept-rep", label: "Dept Rep" },
];

/** User & account management — all accounts across the three roles. */
export default function UserManagement() {
  const app = useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [manage, setManage] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  //from users hook
  const {
    data: users = [],
    isLoading,
    error,
  } = useUsers(app.session.accessToken);

  const query = search.trim().toLowerCase();
  const rows = users.filter((user) => {
    const byRole = filter === "All" || user.role === filter;
    const byQuery =
      !query ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    return byRole && byQuery;
  });

  // Reset to page 1 when search or role filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const startIndex = (page - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);
  const showing = `Showing ${rows.length === 0 ? 0 : startIndex + 1}–${Math.min(startIndex + pageSize, rows.length)} of ${rows.length} matching accounts`;
  const copyError = () =>
    app.showToast("Could not copy — select the password and copy it manually.");

  if (error) {
    return <ErrorState>Failed to load users.</ErrorState>;
  }

  return (
    <>
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* Two-up on phones; from md the original auto-fit columns (min 180px). */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
            <StatCard
              label="Total accounts"
              value={users.length}
              note="Across the three roles"
              icon={Users}
            />
            <StatCard
              label="Active"
              value={
                users.filter(
                  (user) => user.status === "active" && !user.isFirstLogin,
                ).length
              }
              note="Signed in at least once"
              tone="success"
              icon={UserCheck}
            />
            <StatCard
              label="Pending first login"
              value={
                users.filter(
                  (user) => user.status !== "deactivated" && user.isFirstLogin,
                ).length
              }
              note="Temporary password issued"
              tone="warning"
              icon={KeyRound}
            />
            <StatCard
              label="Deactivated"
              value={
                users.filter((user) => user.status === "deactivated").length
              }
              note="Access withdrawn"
              icon={UserX}
            />
          </div>

          <Card className="gap-4">
            {/* Phones: search + role dropdown on one row, Create user below.
                md and up: the original row (search, segmented filter, Create user). */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 md:flex md:flex-wrap md:items-center md:gap-3">
              <div className="relative min-w-0 md:max-w-[260px] md:flex-1">
                <Search
                  size={15}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/45 md:hidden"
                />
                <Input
                  className="max-md:min-h-11 max-md:pl-8"
                  placeholder="Search name or work email"
                  aria-label="Search name or work email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative w-[112px] md:hidden">
                <Select
                  aria-label="Filter by role"
                  className="min-h-11 appearance-none pr-8"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  options={FILTERS}
                />
                <ChevronDown
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/60"
                />
              </div>
              <Segmented
                className="max-md:hidden"
                value={filter}
                onChange={setFilter}
                options={FILTERS}
              />
              <Button
                variant="primary"
                className="col-span-2 min-h-11 w-full md:ml-auto md:min-h-0 md:w-auto"
                onClick={() => setCreateOpen(true)}
              >
                Create user
              </Button>
            </div>

            {/* Phones: the account count sits above the list. */}
            <p className="m-0 text-meta text-ink/60 md:hidden">{showing}</p>

            {rows.length ? (
              <>
                {/* lg and up: the existing table (8 columns need the width). */}
                <div className="hidden lg:block">
                  <Table>
                    <THead
                      columns={[
                        "User",
                        "Role",
                        "Department",
                        "Work email",
                        "Account status",
                        "Temporary password",
                        "Last sign-in",
                        { label: "", align: "right" },
                      ]}
                    />
                    <tbody>
                      {paginatedRows.map((user) => (
                        <TRow key={`${user.username}${user._id}`}>
                          <TCell strong>{user.username}</TCell>
                          <TCell>{formatRole(user.role)}</TCell>
                          <TCell>
                            {user.role === "hr"
                              ? "Administration"
                              : capitalize(user.department)}
                          </TCell>
                          <TCell muted className="text-cell">
                            {user.email}
                          </TCell>
                          <TCell>
                            <AccountStatusBadge user={user} />
                          </TCell>
                          <TCell>
                            <TempPassword user={user} onCopyError={copyError} />
                          </TCell>
                          <TCell>{formatRelativeDate(user.lastSignIn)}</TCell>
                          {/* Your own row keeps an empty cell so the columns stay aligned. */}
                          <TCell align="right">
                            {app.session.id !== user._id && (
                              <Button onClick={() => setManage(user)}>
                                Manage access
                              </Button>
                            )}
                          </TCell>
                        </TRow>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Below lg: one card per account (two-up on tablets), same page of rows and handlers. */}
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
                  {paginatedRows.map((user) => {
                    const showTemp =
                      (user.passwordResetRequested && !user.tempPass) ||
                      user.isFirstLogin ||
                      user.tempPass;
                    return (
                      <li
                        key={`${user.username}${user._id}`}
                        className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="break-words text-field font-medium">
                              {user.username}
                            </div>
                            <div className="break-all text-cell text-ink/60">
                              {user.email}
                            </div>
                          </div>
                          <AccountStatusBadge
                            user={user}
                            className="shrink-0"
                          />
                        </div>

                        <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                          <div className="min-w-0">
                            <dt className="text-micro uppercase text-ink/55">
                              Role
                            </dt>
                            <dd className="m-0 break-words text-cell">
                              {formatRole(user.role)}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-micro uppercase text-ink/55">
                              Department
                            </dt>
                            <dd className="m-0 break-words text-cell">
                              {user.role === "hr"
                                ? "Administration"
                                : capitalize(user.department)}
                            </dd>
                          </div>
                          {showTemp && (
                            <div className="col-span-2 min-w-0">
                              <dt className="text-micro uppercase text-ink/55">
                                Temporary password
                              </dt>
                              <dd className="m-0 mt-1">
                                <TempPassword
                                  user={user}
                                  onCopyError={copyError}
                                />
                              </dd>
                            </div>
                          )}
                          {user.lastSignIn && (
                            <div className="col-span-2 min-w-0">
                              <dt className="text-micro uppercase text-ink/55">
                                Last sign-in
                              </dt>
                              <dd className="m-0 text-cell">
                                {formatRelativeDate(user.lastSignIn)}
                              </dd>
                            </div>
                          )}
                        </dl>

                        {app.session.id !== user._id && (
                          <Button
                            // mt-auto lines buttons up across a two-up row.
                            className="mt-auto min-h-11 w-full"
                            aria-label={`Manage access for ${user.username}`}
                            onClick={() => setManage(user)}
                          >
                            Manage access
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <EmptyState>
                No accounts match this search and role filter. Try a different
                name or choose &ldquo;All&rdquo;.
              </EmptyState>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-meta text-ink/50">
                <span className="max-md:hidden">{showing}</span>

                <span>
                  Employee accounts are created through Employees → Add
                  employee, so onboarding requirements are assigned at the same
                  time.
                </span>
              </div>

              {/* Phones: full-width row with icon buttons; md and up unchanged. */}
              <div className="flex items-center gap-2 max-md:order-first max-md:w-full max-md:justify-between">
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

          <CreateUserDialog
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={(user) => {
              queryClient.invalidateQueries({
                //triggers a refresh
                queryKey: ["users"],
              });

              setReceipt(user);
            }}
          />
          <ManageAccessDialog target={manage} onClose={() => setManage(null)} />
          <AccountCreatedDialog
            receipt={receipt}
            onClose={() => setReceipt(null)}
          />
        </>
      )}
    </>
  );
}

/** Account status badge, shared by the desktop table and the mobile cards. */
function AccountStatusBadge({ user, className }) {
  return (
    <Badge
      className={className}
      variant={
        user.status === "deactivated"
          ? "deactivated"
          : user.isFirstLogin
            ? "in-progress"
            : user.status === "active"
              ? "active"
              : ""
      }
    >
      {user.status === "deactivated"
        ? "Deactivated"
        : user.isFirstLogin
          ? "Pending first login"
          : user.status === "active"
            ? "Active"
            : ""}
    </Badge>
  );
}

/** Temporary-password cell: reset badge, masked copy field, or a dash. */
function TempPassword({ user, onCopyError }) {
  if (user.passwordResetRequested && !user.tempPass) {
    return <Badge variant={"in-progress"}>Password Reset Requested</Badge>;
  }
  if (user.isFirstLogin || user.tempPass) {
    return (
      <CopyField
        value={user.password}
        displayValue="••••••••"
        label={`temporary password for ${user.username}`}
        onError={onCopyError}
      />
    );
  }
  return <span className="text-ink/45">{EM_DASH}</span>;
}
