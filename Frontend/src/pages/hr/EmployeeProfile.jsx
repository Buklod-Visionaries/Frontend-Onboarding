import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { OverdueBadge } from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import ReviewDialog from '../../components/feature/requirements/ReviewDialog';
import { useApp } from '../../hooks/useApp';
import { countRequirements, isAwaitingVerification, isOverdue } from '../../domain/requirements';
import { employeeStatus } from '../../domain/employees';
import { formatDate } from '../../domain/date';

/** Employee record, scoped to onboarding requirements. */
export default function EmployeeProfile() {
  const app = useApp();
  const params = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);

  const employee = app.getEmployee(params.id);

  if (!employee) {
    return (
      <Card>
        <p className="m-0 text-field">That employee record does not exist.</p>
        <Button className="mt-3 self-start" onClick={() => navigate('/hr/employees')}>
          Back to list
        </Button>
      </Card>
    );
  }

  const counts = countRequirements(employee);

  return (
    <>
      <Card padding="lg" className="gap-4.5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-[240px] flex-1">
            <div className="text-micro uppercase text-accent-700">
              {employee.department} &middot; {employee.position}
            </div>
            <h2 className="mb-1.5 mt-1 text-[34px]">{employee.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{employeeStatus(employee)}</Badge>
              <span className="text-meta text-ink/55">
                Started {formatDate(employee.start)} &middot; {counts.completed}/{counts.total}{' '}
                requirements completed
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => navigate('/hr/employees')}>Back to list</Button>
            <Button onClick={() => app.sendReminder(employee)}>Send reminder</Button>
          </div>
        </div>

        <ProgressBar value={counts.pct} height="md" />

        <Table>
          <THead
            columns={[
              'Requirement',
              'Type',
              'Owner',
              'Deadline',
              'Status',
              { label: '', align: 'right' }
            ]}
          />
          <tbody>
            {employee.requirements.map((requirement) => {
              const canReview = isAwaitingVerification(requirement);
              return (
                <TRow key={requirement.id}>
                  <TCell>
                    <div className="font-medium">{requirement.name}</div>
                    <div className="text-[11px] text-ink/50">{requirement.subLabel}</div>
                  </TCell>
                  <TCell>{requirement.type}</TCell>
                  <TCell>{requirement.owner}</TCell>
                  <TCell>
                    <div>{formatDate(requirement.deadline)}</div>
                    <OverdueBadge when={isOverdue(requirement)} />
                  </TCell>
                  <TCell>
                    <Badge>{requirement.status}</Badge>
                  </TCell>
                  <TCell align="right">
                    <Button
                      disabled={!canReview}
                      onClick={() => setReview({ employee, requirement })}
                    >
                      {canReview ? 'Review' : 'View'}
                    </Button>
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <ReviewDialog target={review} onClose={() => setReview(null)} />
    </>
  );
}
