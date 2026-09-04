import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import AutoGrid from '../../components/ui/AutoGrid';
import { EmptyState } from '../../components/ui/Notice';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import ConfirmActivityDialog from '../../components/feature/requirements/ConfirmActivityDialog';
import { useDepartmentScope } from '../../hooks/useDepartmentScope';
import { formatDate } from '../../domain/date';

export default function DeptDashboard() {
  const navigate = useNavigate();
  const scope = useDepartmentScope();
  const [confirm, setConfirm] = useState(null);

  const pending = scope.activities.filter((row) => row.requirement.status !== 'Completed');
  const done = (key) => scope.employees.filter((employee) => employee.milestones[key]).length;

  return (
    <>
      <AutoGrid min={190} gap="gap-4">
        <StatCard
          label="Employees in department"
          value={scope.employees.length}
          note={scope.department}
        />
        <StatCard label="Pending confirmations" value={pending.length} note="Activities awaiting you" />
        <StatCard
          label="Orientation done"
          value={`${done('orientation')}/${scope.employees.length}`}
          note="Company orientation"
        />
        <StatCard
          label="Training done"
          value={`${done('training')}/${scope.employees.length}`}
          note="One-month training"
        />
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Activities awaiting your confirmation</h4>
          <Button className="ml-auto" onClick={() => navigate('/dept/requirements')}>
            Department requirements
          </Button>
        </div>

        {pending.length ? (
          <Table>
            <THead
              columns={[
                'Employee',
                'Position',
                'Activity',
                'Target date',
                'Status',
                { label: '', align: 'right' }
              ]}
            />
            <tbody>
              {pending.map((row) => (
                <TRow key={row.requirement.id}>
                  <TCell strong>{row.employee.name}</TCell>
                  <TCell>{row.employee.position}</TCell>
                  <TCell>{row.requirement.name}</TCell>
                  <TCell>{formatDate(row.requirement.deadline)}</TCell>
                  <TCell>
                    <Badge>{row.requirement.status}</Badge>
                  </TCell>
                  <TCell align="right">
                    <Button variant="primary" onClick={() => setConfirm(row)}>
                      Confirm
                    </Button>
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>Nothing is waiting for confirmation in {scope.department}.</EmptyState>
        )}
      </Card>

      <ConfirmActivityDialog target={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
