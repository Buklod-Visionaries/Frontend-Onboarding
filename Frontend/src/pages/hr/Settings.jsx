import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AutoGrid from '../../components/ui/AutoGrid';
import { Field, Input, Select } from '../../components/ui/Field';
import { useApp } from '../../hooks/useApp';

const DEADLINE_OPTIONS = [
  { value: '7', label: '7 days from start date' },
  { value: '10', label: '10 days from start date' },
  { value: '14', label: '14 days from start date' }
];

const REMINDER_OPTIONS = [
  { value: '1', label: '1 day before' },
  { value: '3', label: '3 days before' },
  { value: '5', label: '5 days before' }
];

export default function Settings() {
  const app = useApp();
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const save = () => {
    if (next.length < 6) {
      app.showToast('Use at least 6 characters for the new password.');
      return;
    }
    if (next !== confirm) {
      app.showToast('The two passwords do not match.');
      return;
    }
    setNext('');
    setConfirm('');
    app.showToast('Password updated');
  };

  const setSetting = (key) => (e) => {
    const { value } = e.target;
    app.setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <AutoGrid min={320} className="items-start">
      <Card padding="lg" className="gap-4">
        <h4 className="text-[20px]">Account &amp; profile</h4>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={app.session.name} readOnly />
          </Field>
          <Field label="Work email">
            <Input value={app.session.email} readOnly />
          </Field>
        </div>
        <Field label="New password">
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <Button variant="primary" className="self-start" onClick={save}>
          Update password
        </Button>
      </Card>

      <Card padding="lg" className="gap-4">
        <h4 className="text-[20px]">System settings</h4>
        <Field label="Default deadline for document requirements">
          <Select
            value={app.settings.deadline}
            onChange={setSetting('deadline')}
            options={DEADLINE_OPTIONS}
          />
        </Field>
        <Field label="Reminder notice before a deadline">
          <Select
            value={app.settings.reminder}
            onChange={setSetting('reminder')}
            options={REMINDER_OPTIONS}
          />
        </Field>
        <p className="m-0 text-meta leading-relaxed text-ink/55">
          Applies to newly assigned requirements. Existing deadlines are unchanged.
        </p>
      </Card>
    </AutoGrid>
  );
}
