import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import AutoGrid from '../../components/ui/AutoGrid';
import { Input, Segmented } from '../../components/ui/Field';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/Notice';
import CopyField from '../../components/ui/CopyField';
import CreateUserDialog from '../../components/feature/accounts/CreateUserDialog';
import ManageAccessDialog from '../../components/feature/accounts/ManageAccessDialog';
import AccountCreatedDialog from '../../components/feature/accounts/AccountCreatedDialog';
import { useApp } from '../../hooks/useApp';
import { EM_DASH, TEMP_PASSWORD } from '../../domain/constants';

const FILTERS = [
  { value: 'All', label: 'All' },
  { value: 'HR Staff', label: 'HR Staff' },
  { value: 'Employee', label: 'Employee' },
  { value: 'Department Representative', label: 'Dept Rep' }
];

/** User & account management — all accounts across the three roles. */
export default function UserManagement() {
  const app = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [manage, setManage] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const staff = app.staffUsers.map((user) => ({ kind: 'staff', ...user }));
  const employeeAccounts = app.employees.map((employee) => {
    const status = app.employeeAccounts[employee.id] || 'Pending first login';
    return {
      kind: 'employee',
      id: employee.id,
      name: employee.name,
      role: 'Employee',
      department: employee.department,
      email: employee.email,
      status,
      lastLogin: status === 'Active' ? 'Aug 15, 2026' : EM_DASH
    };
  });
  const accounts = [...staff, ...employeeAccounts];

  const count = (status) => accounts.filter((user) => user.status === status).length;

  const query = search.trim().toLowerCase();
  const rows = accounts.filter((user) => {
    const byRole = filter === 'All' || user.role === filter;
    const byQuery =
      !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    return byRole && byQuery;
  });

  return (
    <>
      <AutoGrid min={180} gap="gap-4">
        <StatCard label="Total accounts" value={accounts.length} note="Across the three roles" />
        <StatCard label="Active" value={count('Active')} note="Signed in at least once" />
        <StatCard
          label="Pending first login"
          value={count('Pending first login')}
          note="Temporary password issued"
        />
        <StatCard label="Deactivated" value={count('Deactivated')} note="Access withdrawn" />
      </AutoGrid>

      <Card className="gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            className="max-w-[260px]"
            placeholder="Search name or work email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Segmented value={filter} onChange={setFilter} options={FILTERS} />
          <Button variant="primary" className="ml-auto" onClick={() => setCreateOpen(true)}>
            Create user
          </Button>
        </div>

        {rows.length ? (
          <Table>
            <THead
              columns={[
                'User',
                'Role',
                'Department',
                'Work email',
                'Account status',
                'Temporary password',
                'Last sign-in',
                { label: '', align: 'right' }
              ]}
            />
            <tbody>
              {rows.map((user) => (
                <TRow key={`${user.kind}${user.id}`}>
                  <TCell strong>{user.name}</TCell>
                  <TCell>{user.role}</TCell>
                  <TCell>{user.department}</TCell>
                  <TCell muted className="text-cell">
                    {user.email}
                  </TCell>
                  <TCell>
                    <Badge>{user.status}</Badge>
                  </TCell>
                  <TCell>
                    {user.status === 'Pending first login' ? (
                      <CopyField
                        value={TEMP_PASSWORD}
                        label={`temporary password for ${user.name}`}
                        onError={() =>
                          app.showToast('Could not copy — select the password and copy it manually.')
                        }
                      />
                    ) : (
                      <span className="text-ink/45">{EM_DASH}</span>
                    )}
                  </TCell>
                  <TCell>{user.lastLogin}</TCell>
                  <TCell align="right">
                    <Button onClick={() => setManage(user)}>Manage access</Button>
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No accounts match this search.</EmptyState>
        )}

        <div className="flex flex-wrap items-baseline gap-4 text-meta text-ink/50">
          <span>
            Showing {rows.length} of {accounts.length} accounts
          </span>
          <span>
            Employee accounts are created through Employees &rarr; Add employee, so onboarding requirements
            are assigned at the same time.
          </span>
        </div>
      </Card>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={setReceipt}
      />
      <ManageAccessDialog target={manage} onClose={() => setManage(null)} />
      <AccountCreatedDialog receipt={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
