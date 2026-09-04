import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';

/** Receipt shown after an account is created, with the temporary credentials. */
export default function AccountCreatedDialog({ receipt, onClose }) {
  if (!receipt) return null;

  return (
    <Modal
      open
      onClose={onClose}
      kicker="Account created"
      title={receipt.name}
      actions={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <dl className="grid gap-2 text-field" style={{ gridTemplateColumns: '150px 1fr' }}>
        <dt className="text-ink/50">Role</dt>
        <dd className="m-0">{receipt.role}</dd>
        <dt className="text-ink/50">Department</dt>
        <dd className="m-0">{receipt.department}</dd>
        <dt className="text-ink/50">Work email</dt>
        <dd className="m-0">{receipt.email}</dd>
        <dt className="text-ink/50">Temporary password</dt>
        <dd className="m-0 font-heading">{receipt.temp}</dd>
        <dt className="text-ink/50">Account status</dt>
        <dd className="m-0">Pending first login</dd>
      </dl>

      {receipt.requirementCount ? (
        <Notice>
          {receipt.requirementCount} onboarding requirements were assigned automatically from the position
          and department. The employee can sign in and view them immediately.
        </Notice>
      ) : null}
    </Modal>
  );
}
