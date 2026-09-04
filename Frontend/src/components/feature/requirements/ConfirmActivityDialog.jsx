import { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { Field, Input } from '../../ui/Field';
import { useApp } from '../../../hooks/useApp';

function ConfirmActivityDialogBody({ employee, requirement, onClose }) {
  const app = useApp();
  const [note, setNote] = useState('');

  return (
    <Modal
      open
      onClose={onClose}
      title={`Confirm ${requirement.name}`}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              app.confirmActivity(employee, requirement);
              onClose();
            }}
          >
            Confirm completion
          </Button>
        </>
      }
    >
      <p className="m-0 text-field leading-relaxed text-ink/70">
        Mark <b>{requirement.name}</b> as completed for {employee.name}? HR will be notified and the
        employee&rsquo;s onboarding record will be updated.
      </p>
      <Field label="Note (optional)">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Completed on schedule with the laboratory team"
        />
      </Field>
    </Modal>
  );
}

/**
 * Department representative confirms orientation / training / team introduction.
 * `target` is `{ employee, requirement }`, or null when closed.
 */
export default function ConfirmActivityDialog({ target, onClose }) {
  if (!target) return null;
  return (
    <ConfirmActivityDialogBody
      key={target.requirement.id}
      employee={target.employee}
      requirement={target.requirement}
      onClose={onClose}
    />
  );
}
