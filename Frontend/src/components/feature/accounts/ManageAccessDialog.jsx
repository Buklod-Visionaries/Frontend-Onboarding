import { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { Field, Segmented, Select } from '../../ui/Field';
import { ACCOUNT_STATUSES, DEPARTMENTS } from '../../../domain/constants';
import { useApp } from '../../../hooks/useApp';

const NOTES = {
  Employee:
    'Employee records, requirements and verification remain with HR. Deactivating an account only removes sign-in access.',
  'Department Representative':
    'Department representatives can confirm department activities for their assigned department only.',
  'HR Staff': 'HR staff have full administrative access to onboarding records.'
};

function ManageAccessDialogBody({ target, onClose }) {
  const app = useApp();
  const [status, setStatus] = useState(target.status);
  const [department, setDepartment] = useState(target.department);

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[520px]"
      kicker="Manage user access"
      title={target.name}
      subtitle={`${target.role} · ${target.department}`}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              app.updateAccount(target, { status: 'Pending first login' });
              app.showToast(`Temporary password issued for ${target.name}`);
              onClose();
            }}
          >
            Reset to temporary password
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              app.updateAccount(target, { status, department });
              app.showToast(`Access updated for ${target.name}`);
              onClose();
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      {target.role === 'Department Representative' && (
        <Field label="Assigned department">
          <Select
            value={department}
            options={DEPARTMENTS}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </Field>
      )}
      <Field label="Account status">
        <Segmented value={status} onChange={setStatus} options={ACCOUNT_STATUSES} />
      </Field>
      <p className="m-0 text-meta leading-relaxed text-ink/55">{NOTES[target.role]}</p>
    </Modal>
  );
}

/** Manage user access: account status, and department for representatives. */
export default function ManageAccessDialog({ target, onClose }) {
  if (!target) return null;
  return <ManageAccessDialogBody key={`${target.kind}-${target.id}`} target={target} onClose={onClose} />;
}
