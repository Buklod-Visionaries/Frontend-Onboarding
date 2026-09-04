import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Notice';
import { TCell, THead, TRow, Table } from '../../components/ui/Table';
import ReviewDialog from '../../components/feature/requirements/ReviewDialog';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';
import { formatDate } from '../../domain/date';

/** Requirement verification queue — every submission awaiting HR review. */
export default function Verification() {
  const [review, setReview] = useState(null);
  const queue = useVerificationQueue();

  return (
    <>
      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Pending verification</h4>
          <span className="text-meta text-ink/55">
            {queue.length} {queue.length === 1 ? 'submission' : 'submissions'} in queue
          </span>
        </div>

        {queue.length ? (
          <Table>
            <THead
              columns={[
                'Employee',
                'Department',
                'Requirement',
                'File',
                'Submitted',
                'Deadline',
                { label: '', align: 'right' }
              ]}
            />
            <tbody>
              {queue.map((row) => (
                <TRow key={row.requirement.id}>
                  <TCell strong>{row.employee.name}</TCell>
                  <TCell>{row.employee.department}</TCell>
                  <TCell>{row.requirement.name}</TCell>
                  <TCell className="font-heading text-cell text-accent-700">
                    {row.requirement.file || '—'}
                  </TCell>
                  <TCell>{formatDate(row.requirement.submitted)}</TCell>
                  <TCell>{formatDate(row.requirement.deadline)}</TCell>
                  <TCell align="right">
                    <Button variant="primary" onClick={() => setReview(row)}>
                      Review
                    </Button>
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
