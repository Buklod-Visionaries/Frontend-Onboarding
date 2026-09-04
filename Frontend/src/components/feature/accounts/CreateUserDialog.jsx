import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Notice from '../../ui/Notice';
import { Field, Input, Radio, Select } from '../../ui/Field';
import { DEPARTMENTS, ROLES, TEMP_PASSWORD } from '../../../domain/constants';
import { useApp } from '../../../hooks/useApp';

function CreateUserDialogBody({ onClose, onCreated }) {
  const app = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState('HR Staff');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Laboratory');

  const submit = () => {
    if (role === 'Employee') {
      onClose();
      navigate('/hr/employees/new');
      return;
    }
    if (!name.trim()) {
      app.showToast('Enter the user’s full name.');
      return;
    }
    const receipt = app.createStaffUser({ role, name: name.trim(), email, department });
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
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            {role === 'Employee' ? 'Continue to Add employee' : 'Create account'}
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

      {role === 'Employee' ? (
        <Notice>
          Employee accounts are created together with the onboarding record so requirements can be assigned
          from the position and department. Continue to Add Employee.
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
            {role === 'Department Representative' && (
              <Field label="Assigned department">
                <Select
                  value={department}
                  options={DEPARTMENTS}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </Field>
            )}
            <Field label="Temporary password">
              <Input value={TEMP_PASSWORD} readOnly />
            </Field>
          </div>
          <p className="m-0 text-meta text-ink/55">The user sets their own password on first login.</p>
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
