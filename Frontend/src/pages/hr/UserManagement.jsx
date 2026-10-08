import { useState } from "react";
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
import { formatDate, formatRelativeDate } from "../../domain/date";
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
              value={users.filter((user) => user.isFirstLogin).length}
              note="Temporary password issued"
            />
            <StatCard
              label="Deactivated"
              value={users.filter((user) => !user).length}
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
                  {rows.map((user, index) => (
                    <TRow key={`${user.username}${user._id}`}>
                      <TCell strong>{user.username}</TCell>
                      <TCell>{formatRole(user.role)}</TCell>
                      <TCell>
                        {user.role === "hr" ? "-" : capitalize(user.department)}
                      </TCell>
                      <TCell muted className="text-cell">
                        {user.email}
                      </TCell>
                      <TCell>
                        <Badge
                          variant={user.isFirstLogin ? "in-progress" : "active"}
                        >
                          {user.isFirstLogin ? "Pending First Login" : "Active"}
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
                      {app.session._id !== user._id && (
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

            <div className="flex flex-wrap items-baseline gap-4 text-meta text-ink/50">
              <span>
                Showing {rows.length} of {users.length} accounts
              </span>
              <span>
                Employee accounts are created through Employees &rarr; Add
                employee, so onboarding requirements are assigned at the same
                time.
              </span>
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
