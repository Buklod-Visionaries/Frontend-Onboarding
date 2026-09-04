import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Field';
import { useApp } from '../../hooks/useApp';

/** First-time login: the temporary password issued by HR is replaced here. */
export default function FirstLogin() {
  const app = useApp();
  const navigate = useNavigate();
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = () => {
    if (next.length < 6) {
      app.showToast('Use at least 6 characters for the new password.');
      return;
    }
    if (next !== confirm) {
      app.showToast('The two passwords do not match.');
      return;
    }
    const home = app.login('Employee');
    app.showToast('Password updated — signed in as Maricel Bautista');
    navigate(home);
  };

  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">First-time login</div>
          <h2 className="mt-1.5 text-[30px]">Set your password</h2>
        </div>

        <p className="m-0 text-cell leading-relaxed text-ink/65">
          Your account was created by HR with a temporary password. Set a new password to continue to your
          onboarding requirements.
        </p>

        <Field label="Work email">
          <Input value="m.bautista@pmcl.ph" readOnly />
        </Field>
        <Field label="Temporary password">
          <Input type="password" value="temporary" readOnly />
        </Field>
        <Field label="New password">
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <Field label="Confirm new password">
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>

        <Button variant="primary" block className="h-[42px]" onClick={submit}>
          Save password &amp; continue
        </Button>

        <Link to="/login" className="self-center">
          <Button variant="ghost">Back to sign in</Button>
        </Link>
      </Card>
    </AuthLayout>
  );
}
