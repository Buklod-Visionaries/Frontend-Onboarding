import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AutoGrid from '../../components/ui/AutoGrid';
import DividerList, { DividerRow } from '../../components/ui/DividerList';
import Notice, { SectionHeading } from '../../components/ui/Notice';
import { Field, Input, Select } from '../../components/ui/Field';
import AccountCreatedDialog from '../../components/feature/accounts/AccountCreatedDialog';
import { POSITIONS, POSITION_NAMES } from '../../data/positions';
import { buildRequirements } from '../../domain/requirements';
import { TEMP_PASSWORD } from '../../domain/constants';
import { useApp } from '../../hooks/useApp';

const DEFAULT_START = '2026-08-24';

/**
 * Add Employee: employee information, position + department, account information.
 * Creating the record creates the account and assigns the requirements together.
 */
export default function AddEmployee() {
  const app = useApp();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    start: DEFAULT_START,
    position: 'Medical Technologist'
  });

  const department = POSITIONS[form.position].department;
  const preview = buildRequirements(form.position, form.start || DEFAULT_START, 'preview');

  const set = (key) => (e) => {
    const { value } = e.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!form.name.trim()) {
      app.showToast('Enter the employee name first.');
      return;
    }
    setReceipt(app.createEmployee(form));
  };

  return (
    <>
      <AutoGrid min={320} className="items-start">
        <Card padding="lg" className="gap-4">
          <SectionHeading step="01">Employee information</SectionHeading>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.name} onChange={set('name')} placeholder="e.g. Maria Santos" />
            </Field>
            <Field label="Mobile number">
              <Input value={form.phone} onChange={set('phone')} placeholder="+63 9XX XXX XXXX" />
            </Field>
            <Field label="Start date">
              <Input type="date" value={form.start} onChange={set('start')} />
            </Field>
          </div>

          <SectionHeading step="02">Position &amp; department</SectionHeading>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Position">
              <Select value={form.position} options={POSITION_NAMES} onChange={set('position')} />
            </Field>
            <Field label="Department (from position)">
              <Input value={department} readOnly />
            </Field>
          </div>
          <Notice>
            The position and department determine which onboarding requirements are assigned &mdash; see the
            list on the right before creating the record.
          </Notice>

          <SectionHeading step="03">Account information</SectionHeading>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Work email (username)">
              <Input value={form.email} onChange={set('email')} placeholder="name@pmcl.ph" />
            </Field>
            <Field label="Role">
              <Input value="Employee" readOnly />
            </Field>
            <Field label="Temporary password">
              <Input value={TEMP_PASSWORD} readOnly />
            </Field>
            <Field label="Account status on creation">
              <Input value="Pending first login" readOnly />
            </Field>
          </div>
          <span className="text-meta text-ink/55">
            The employee is required to set a new password on first login.
          </span>

          <div className="flex flex-wrap justify-end gap-2.5">
            <Button onClick={() => navigate('/hr/employees')}>Cancel</Button>
            <Button variant="primary" onClick={submit}>
              Create employee account &amp; assign requirements
            </Button>
          </div>
        </Card>

        <Card padding="lg" className="gap-3.5">
          <div>
            <div className="text-micro uppercase text-accent-700">Automatic assignment</div>
            <h4 className="mt-1 text-[20px]">Requirements for this position</h4>
          </div>
          <p className="m-0 text-cell text-ink/60">
            {preview.length} requirements are assigned automatically for {form.position} in {department}. HR
            can adjust them afterwards on the employee record.
          </p>
          <DividerList>
            {preview.map((requirement) => (
              <DividerRow key={requirement.id} className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="text-cell text-accent">&#10003;</span>
                <span className="flex-1 text-field">{requirement.name}</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-ink/45">
                  {requirement.type}
                </span>
              </DividerRow>
            ))}
          </DividerList>
        </Card>
      </AutoGrid>

      <AccountCreatedDialog
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          navigate('/hr/employees');
        }}
      />
    </>
  );
}
