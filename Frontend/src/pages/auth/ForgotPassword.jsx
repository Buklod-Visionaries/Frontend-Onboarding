import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Notice from "../../components/ui/Notice";
import { Field, Input } from "../../components/ui/Field";
import { useApp } from "../../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import { useRequestPasswordReset } from "../../hooks/useAuth";

/** Password resets are handled by HR — no email or SMS in scope. */
export default function ForgotPassword() {
  const app = useApp();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const requestPasswordResetMutation = useRequestPasswordReset(); //rename hook mutation

  const submit = async () => {
    try {
      if (!email.trim()) {
        app.showToast("Enter your work email first.");
        return;
      }
      if (!email.includes("@gmail.com")) {
        return app.showToast("Email must end with @gmail.com");
      }
      app.notify(
        "HR",
        "Password reset requested",
        `${email.trim()} requested a password reset.`,
      );
      const res = await requestPasswordResetMutation.mutateAsync(email); // set email to request password reset API call
      queryClient.invalidateQueries({
        queryKey: ["users"], //reload users
      });
      app.showToast(res.message);
      setSent(true);
    } catch (error) {
      app.showToast(error.response.data.message);
    }
  };

  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">
            Forgot password
          </div>
          <h2 className="mt-1.5 text-[30px]">Request a reset</h2>
        </div>

        {sent ? (
          <Notice>
            Your request was sent to the HR Department. HR will issue a
            temporary password for your next sign-in.
          </Notice>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="m-0 text-cell leading-relaxed text-ink/65">
              Password resets are handled by HR. Enter your work email and HR
              will issue a temporary password.
            </p>
            <Field label="Work email">
              <Input
                value={email}
                placeholder="name@pmcl.ph"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button
              variant="primary"
              block
              className="h-[42px]"
              onClick={submit}
            >
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
