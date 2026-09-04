import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

/** Confirmation before ending the session. Shown at every screen size. */
export default function SignOutDialog({ open, onClose, onConfirm, name }) {
  if (!open) return null;

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[440px]"
      kicker="Account"
      title="Sign out"
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>
            Sign out
          </Button>
        </>
      }
    >
      <p className="m-0 text-field leading-relaxed text-ink/70">
        Sign out of the onboarding system{name ? `, ${name}` : ''}? You will need to sign in again to
        reach your records.
      </p>
    </Modal>
  );
}
