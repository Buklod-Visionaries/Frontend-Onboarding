import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Notice from "../../ui/Notice";
import { Field, Input, Radio, Select } from "../../ui/Field";
import { ROLES, TEMP_PASSWORD } from "../../../domain/constants";
import { useApp } from "../../../hooks/useApp";
//
import { RefreshCcw } from "lucide-react";
import { CopyButton } from "../../ui/CopyField";
import { generatePassword } from "../../../lib/generateTempPassword";

const departments = [
  "Select department",
  "Laboratory",
  "Imaging",
  "Cardiovascular",
  "Administration",
];

function CreateUserDialogBody({ onClose, onCreated }) {
  const app = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState("HR Staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [tempPass, setTempPass] = useState(generatePassword());
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (role === "Employee") {
      onClose();
      navigate("/hr/employees/new");
      return;
    }
    if (!name.trim() || !email) {
      app.showToast("Enter the user’s full name.");
      return;
    }
    if (
      role === "Department Representative" &&
      department === "Select department"
    ) {
      app.showToast("Select a department.");
      return;
    }
    if (!email.endsWith("@gmail.com") && !email.endsWith("@pmcl.ph")) {
      app.showToast("Email must end with either @pmcl.ph or @gmail.com");
      return;
    }
    const receipt = await app.createStaffUser(
      role,
      name,
      email,
      tempPass,
      department,
      setLoading,
    );
    onClose();
    onCreated(receipt);
  };

  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[560px]"
      kicker="User & account management"
      title="Create user account"
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={loading}>
            {role === "Employee"
              ? "Continue to Add employee"
              : loading
                ? "Creating account..."
                : "Create account"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <span className="text-meta text-ink/65">Select role</span>
        {ROLES.map((option) => (
          <Radio
            key={option}
            name="create-user-role"
            checked={role === option}
            onChange={() => setRole(option)}
          >
            {option}
          </Radio>
        ))}
      </div>

      {role === "Employee" ? (
        <Notice>
          Employee accounts are created together with the onboarding record so
          requirements can be assigned from the position and department.
          Continue to Add Employee.
        </Notice>
      ) : (
        <div className="flex flex-col gap-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Full name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ronald Estrada"
              />
            </Field>
            <Field label="Work email (username)">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@pmcl.ph"
              />
            </Field>
            {role === "Department Representative" && (
              <Field label="Assigned department">
                <Select
                  value={department}
                  options={departments}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </Field>
            )}
            <div className="flex flex-row items-end gap-2">
              <Field label="Temporary password" className="min-w-0 flex-1">
                <Input value={tempPass} readOnly />
              </Field>
              {/* A real button (same handler) so it is keyboard-reachable and labelled. */}
              <button
                type="button"
                aria-label="Generate a new temporary password"
                title="Generate a new temporary password"
                onClick={() => setTempPass(generatePassword())}
                className="group flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control border border-divider text-ink/70 transition-colors hover:bg-ink/[0.07] hover:text-ink max-sm:size-10"
              >
                <RefreshCcw
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-rotate-90 motion-reduce:transition-none"
                />
              </button>
              <CopyButton
                value={tempPass}
                label="temporary password"
                onError={() =>
                  app.showToast(
                    "Could not copy — select the password and copy it manually.",
                  )
                }
              />
            </div>
          </div>
          <p className="m-0 text-meta text-ink/55">
            The user sets their own password on first login.
          </p>
        </div>
      )}
    </Modal>
  );
}

/**
 * Create User — role first. HR Staff and Department Representative accounts are
 * created here; Employee accounts route to Add Employee so requirements can be
 * assigned from the position and department at the same time.
 *
 * The body only mounts while open, so each opening starts from a blank form.
 */
export default function CreateUserDialog({ open, onClose, onCreated }) {
  if (!open) return null;
  return <CreateUserDialogBody onClose={onClose} onCreated={onCreated} />;
}
