import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Field, Input } from "../../ui/Field";
import { useApp } from "../../../hooks/useApp";
//
import api from "../../../lib/axios";

function ConfirmActivityDialogBody({
  empReq,
  setDepRequirements,
  setConfirmLoading,
  onClose,
}) {
  const app = useApp();
  const [note, setNote] = useState("");

  return (
    <Modal
      open
      onClose={onClose}
      title={`Confirm ${empReq.requirement.name}`}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              app.confirmActivity(
                empReq._id,
                setDepRequirements,
                setConfirmLoading,
              );
              onClose();
            }}
          >
            Confirm completion
          </Button>
        </>
      }
    >
      <p className="m-0 text-field leading-relaxed text-ink/70">
        Mark <b>{empReq.requirement.name}</b> as completed for{" "}
        {empReq.employee.user.username}? HR will be notified and the
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
export default function ConfirmActivityDialog({
  target,
  onClose,
  setDepRequirements,
  setConfirmLoading,
}) {
  if (!target) return null;
  return (
    <ConfirmActivityDialogBody
      key={target.requirement._id}
      setDepRequirements={setDepRequirements}
      setConfirmLoading={setConfirmLoading}
      empReq={target}
      onClose={onClose}
    />
  );
}
