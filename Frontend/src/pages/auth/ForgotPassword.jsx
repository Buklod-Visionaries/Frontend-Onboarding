import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Notice from '../../components/ui/Notice';
import { Field, Input } from '../../components/ui/Field';
import { useApp } from '../../hooks/useApp';

/** Password resets are handled by HR — no email or SMS in scope. */
export default function ForgotPassword() {
  const app = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!email.trim()) {
      app.showToast('Enter your work email first.');
      return;
    }
    app.notify('HR', 'Password reset requested', `${email.trim()} requested a password reset.`);
    setSent(true);
  };

  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">Forgot password</div>
          <h2 className="mt-1.5 text-[30px]">Request a reset</h2>
        </div>

        {sent ? (
          <Notice>
            Your request was sent to the HR Department. HR will issue a temporary password for your next
            sign-in.
          </Notice>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="m-0 text-cell leading-relaxed text-ink/65">
              Password resets are handled by HR. Enter your work email and HR will issue a temporary
              password.
            </p>
            <Field label="Work email">
              <Input
                value={email}
                placeholder="name@pmcl.ph"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button variant="primary" block className="h-[42px]" onClick={submit}>
              Send request to HR
            </Button>
          </div>
        )}

        <Link to="/login" className="self-center">
          <Button variant="ghost">Back to sign in</Button>
        </Link>
      </Card>
    </AuthLayout>
  );
}
