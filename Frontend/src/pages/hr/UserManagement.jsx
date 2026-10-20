import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import AutoGrid from "../../components/ui/AutoGrid";
import { Input, Segmented } from "../../components/ui/Field";
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

  if (error) {
    return <p>Failed to load users.</p>;
  }

  return (
    <>
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <AutoGrid min={180} gap="gap-4">
            <StatCard
              label="Total accounts"
              value={users.length}
              note="Across the three roles"
            />
            <StatCard
              label="Active"
              value={users.filter((user) => !user.isFirstLogin).length}
              note="Signed in at least once"
            />
            <StatCard
              label="Pending first login"
              value={
                users.filter(
                  (user) => user.status === "active" && user.isFirstLogin,
                ).length
              }
              note="Temporary password issued"
            />
            <StatCard
              label="Deactivated"
              value={
                users.filter((user) => user.status === "deactivated").length
              }
              note="Access withdrawn"
            />
          </AutoGrid>

          <Card className="gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                className="max-w-[260px]"
                placeholder="Search name or work email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Segmented
                value={filter}
                onChange={setFilter}
                options={FILTERS}
              />
              <Button
                variant="primary"
                className="ml-auto"
                onClick={() => setCreateOpen(true)}
              >
                Create user
              </Button>
            </div>

            {rows.length ? (
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
                        <Badge
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
                      </TCell>
                      <TCell>
                        {user.passwordResetRequested && !user.tempPass ? (
                          <Badge variant={"in-progress"}>
                            Password Reset Requested
                          </Badge>
                        ) : user.isFirstLogin || user.tempPass ? (
                          <CopyField
                            value={user.password}
                            displayValue="••••••••"
                            label={`temporary password for ${user.name}`}
                            onError={() =>
                              app.showToast(
                                "Could not copy — select the password and copy it manually.",
                              )
                            }
                          />
                        ) : (
                          <span className="text-ink/45">{EM_DASH}</span>
                        )}
                      </TCell>
                      <TCell>{formatRelativeDate(user.lastSignIn)}</TCell>
                      {app.session.id !== user._id && (
                        <TCell align="right">
                          <Button onClick={() => setManage(user)}>
                            Manage access
                          </Button>
                        </TCell>
                      )}
                    </TRow>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState>No accounts match this search.</EmptyState>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-meta text-ink/50">
                <span>
                  Showing {rows.length === 0 ? 0 : startIndex + 1}
                  {"–"}
                  {Math.min(startIndex + pageSize, rows.length)}
                  {" of "}
                  {rows.length} matching accounts
                </span>

                <span>
                  Employee accounts are created through Employees → Add
                  employee, so onboarding requirements are assigned at the same
                  time.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>

                <span className="whitespace-nowrap text-meta text-ink/70">
                  Page {page} of {totalPages}
                </span>

                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
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
