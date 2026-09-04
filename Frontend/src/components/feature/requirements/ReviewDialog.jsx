import { useState } from 'react';
import { FileText } from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import { Field, Textarea } from '../../ui/Field';
import { formatDate } from '../../../domain/date';
import { useApp } from '../../../hooks/useApp';

function ReviewDialogBody({ employee, requirement, onClose }) {
  const app = useApp();
  const [resubmitMode, setResubmitMode] = useState(false);
  const [reason, setReason] = useState('');

  const approve = () => {
    app.approveRequirement(requirement);
    onClose();
  };

  const resubmit = () => {
    if (!resubmitMode) {
      setResubmitMode(true);
      return;
    }
    if (!reason.trim()) {
      app.showToast('Add a short reason so the employee knows what to correct.');
      return;
    }
    app.requestResubmission(employee);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[720px]"
      kicker="Requirement verification"
      title={requirement.name}
      subtitle={`${employee.name} · ${employee.position} · ${employee.department}`}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={resubmit}>
            {resubmitMode ? 'Send resubmission request' : 'Request resubmission'}
          </Button>
          {!resubmitMode && (
            <Button variant="primary" onClick={approve}>
              Approve &amp; mark completed
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 border border-divider bg-surface">
          <FileText size={30} strokeWidth={1.5} className="text-accent" />
          <div className="font-heading text-[15px]">{requirement.file || 'no_file.pdf'}</div>
          <div className="text-[11px] text-ink/50">Document preview</div>
        </div>

        <div className="flex flex-col gap-3">
          <dl className="grid gap-2 text-cell" style={{ gridTemplateColumns: '110px 1fr' }}>
            <dt className="text-ink/50">Type</dt>
            <dd className="m-0">{requirement.type}</dd>
            <dt className="text-ink/50">Submitted</dt>
            <dd className="m-0">{formatDate(requirement.submitted)}</dd>
            <dt className="text-ink/50">Deadline</dt>
            <dd className="m-0">{formatDate(requirement.deadline)}</dd>
            <dt className="text-ink/50">Status</dt>
            <dd className="m-0">
              <Badge>{requirement.status}</Badge>
            </dd>
          </dl>

          {resubmitMode && (
            <Field label="Reason for resubmission (sent to the employee)">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The uploaded scan is cut off. Please upload a full copy of the document."
              />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  );
}

/**
 * HR document review: approve, or send back for resubmission with a reason.
 * `target` is `{ employee, requirement }`, or null when closed.
 *
 * The body is keyed on the requirement so opening a different submission mounts
 * a fresh form rather than carrying the previous reason across.
 */
export default function ReviewDialog({ target, onClose }) {
  if (!target) return null;
  return (
    <ReviewDialogBody
      key={target.requirement.id}
      employee={target.employee}
      requirement={target.requirement}
      onClose={onClose}
    />
  );
}
