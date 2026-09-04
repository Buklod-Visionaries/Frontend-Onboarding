import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import AutoGrid from '../../components/ui/AutoGrid';
import { EventList } from '../../components/ui/Timeline';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/Notice';
import ReviewDialog from '../../components/feature/requirements/ReviewDialog';
import { useApp } from '../../hooks/useApp';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';
import { countRequirements } from '../../domain/requirements';
import { employeeStatus } from '../../domain/employees';
import { formatDate } from '../../domain/date';

export default function HrDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  const queue = useVerificationQueue();
  const [review, setReview] = useState(null);

  let pending = 0;
  let overdue = 0;
  let inProgress = 0;
  let completed = 0;

  for (const employee of app.employees) {
    const counts = countRequirements(employee);
    pending += counts.pending;
    overdue += counts.overdue;
    if (employeeStatus(employee) === 'Completed') completed += 1;
    else inProgress += 1;
  }

  const attention = app.employees
    .filter((employee) => {
      const counts = countRequirements(employee);
      return counts.overdue > 0 || counts.pending > 3;
    })
    .slice(0, 5);

  return (
    <>
      <AutoGrid min={190} gap="gap-4">
        <StatCard label="Total employees" value={app.employees.length} note="Onboarding records on file" />
        <StatCard label="In progress" value={inProgress} note="Onboarding not yet complete" />
        <StatCard label="Pending requirements" value={pending} note="Not yet submitted" />
        <StatCard label="Overdue" value={overdue} note="Past deadline" />
        <StatCard label="Completed" value={completed} note="Fully onboarded" />
      </AutoGrid>

      <AutoGrid min={340}>
        <Card className="gap-3.5">
          <div className="flex items-baseline gap-2.5">
            <h4 className="text-[20px]">Employees requiring attention</h4>
            <Button variant="ghost" className="ml-auto" onClick={() => navigate('/hr/employees')}>
              View all
            </Button>
          </div>
          {attention.length ? (
            <div className="flex flex-col">
              {attention.map((employee) => {
                const counts = countRequirements(employee);
                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => navigate(`/hr/employees/${employee.id}`)}
                    className="grid items-center gap-x-3 gap-y-1 border-b border-ink/[0.08] px-2 py-3 text-left last:border-0 hover:bg-ink/[0.03]"
                    style={{ gridTemplateColumns: '1fr auto' }}
                  >
                    <span className="text-field font-medium">{employee.name}</span>
                    <Badge>{employeeStatus(employee)}</Badge>
                    <span className="text-meta text-ink/55">
                      {counts.overdue
                        ? `${counts.overdue} overdue · ${counts.pending} pending`
                        : `${counts.pending} requirements pending`}
                    </span>
                    <span className="text-[11px] text-ink/45">
                      {employee.department} &middot; {employee.position}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState>No employees need attention right now.</EmptyState>
          )}
        </Card>

        <Card className="gap-3.5">
          <h4 className="text-[20px]">Recent onboarding activity</h4>
          <EventList items={app.activity.slice(0, 6)} round />
        </Card>
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Awaiting verification</h4>
          <span className="text-meta text-ink/55">
            {queue.length} {queue.length === 1 ? 'submission' : 'submissions'} in queue
          </span>
          <Button className="ml-auto" onClick={() => navigate('/hr/requirements')}>
            Open verification queue
          </Button>
        </div>
        {queue.length ? (
          <Table>
            <THead
              columns={[
                'Employee',
                'Requirement',
                'Submitted',
                'Deadline',
                { label: '', align: 'right' }
              ]}
            />
            <tbody>
              {queue.slice(0, 4).map((row) => (
                <TRow key={row.requirement.id}>
                  <TCell strong>{row.employee.name}</TCell>
                  <TCell>{row.requirement.name}</TCell>
                  <TCell>{formatDate(row.requirement.submitted)}</TCell>
                  <TCell>{formatDate(row.requirement.deadline)}</TCell>
                  <TCell align="right">
                    <Button onClick={() => setReview(row)}>Review</Button>
                  </TCell>
                </TRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No submissions are waiting for review.</EmptyState>
        )}
      </Card>

      <ReviewDialog target={review} onClose={() => setReview(null)} />
    </>
  );
}
