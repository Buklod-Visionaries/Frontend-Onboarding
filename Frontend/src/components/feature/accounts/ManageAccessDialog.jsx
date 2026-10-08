import { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Field, Segmented, Select } from "../../ui/Field";
import { ACCOUNT_STATUSES, DEPARTMENTS } from "../../../domain/constants";
import { useApp } from "../../../hooks/useApp";
import { formatRole } from "../../../lib/formatter";
import { capitalize } from "../../../lib/capitalize";
//
import { useQueryClient } from "@tanstack/react-query";
import { useResetTempPass } from "../../../hooks/useUsers";
import { generatePassword } from "../../../lib/generateTempPassword";

const NOTES = {
  Employee:
    "Employee records, requirements and verification remain with HR. Deactivating an account only removes sign-in access.",
  "Department Representative":
    "Department representatives can confirm department activities for their assigned department only.",
  "HR Staff": "HR staff have full administrative access to onboarding records.",
};

function ManageAccessDialogBody({ target, onClose }) {
  const app = useApp();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(target.status);
  const [department, setDepartment] = useState(target.department);
  const [tempPass, setTempPass] = useState(generatePassword());

  //pass the user token on reset pass hook
  const resetPasswordMutation = useResetTempPass(app.session.accessToken);

  //sends the userId and generated tempPass to the hook patch request
  const resetTempPass = async () => {
    await resetPasswordMutation.mutateAsync({
      userId: target._id,
      tempPass,
    });
    //reloads users
    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[520px]"
      kicker="Manage user access"
      title={target.username}
      subtitle={`${formatRole(target.role)} ${target.position ? ` · ${capitalize(target.position)}` : target.department ? ` · ${capitalize(target.department)}` : ""}`}
      actions={
        <>
          <Button onClick={onClose} disabled={resetPasswordMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await resetTempPass();
                app.showToast(
                  `Temporary password issued for ${target.username}`,
                );
                onClose();
              } catch (error) {
                console.error(error);
                app.showToast("Failed to reset temporary password");
              }
            }}
            disabled={resetPasswordMutation.isPending}
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
            disabled={
              resetPasswordMutation.isPending || status === target.status
            }
          >
            Save changes
          </Button>
        </>
      }
    >
      {target.role === "Department Representative" && (
        <Field label="Assigned department">
          <Select
            value={department}
            options={DEPARTMENTS}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </Field>
      )}
      <Field label="Account status">
        <Segmented
          value={status}
          onChange={setStatus}
          options={ACCOUNT_STATUSES}
        />
      </Field>
      <p className="m-0 text-meta leading-relaxed text-ink/55">
        {NOTES[target.role]}
      </p>
    </Modal>
  );
}

/** Manage user access: account status, and department for representatives. */
export default function ManageAccessDialog({ target, onClose }) {
  if (!target) return null;
  return (
    <ManageAccessDialogBody
      key={`${target.kind}-${target.id}`}
      target={target}
      onClose={onClose}
    />
  );
}
