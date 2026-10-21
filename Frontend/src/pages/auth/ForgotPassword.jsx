import { useRef, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import AuthLayout, { AuthCard } from "../../components/layout/AuthLayout";
import Notice from "../../components/ui/Notice";
import { Input } from "../../components/ui/Field";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { useApp } from "../../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import { useRequestPasswordReset } from "../../hooks/useAuth";

const NETWORK_ERROR = "Unable to reach the server. Check your connection and try again.";
const UNKNOWN_ERROR = "Request failed. Please try again.";

/** Password resets are handled by HR — no email or SMS in scope. */
export default function ForgotPassword() {
  const app = useApp();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  // { message, invalid } — the message shown in the toast is also kept
  // inline; `invalid` marks the email field when the message is about it.
  const [error, setError] = useState(null);
  const emailRef = useRef(null);

  const requestPasswordResetMutation = useRequestPasswordReset(); //rename hook mutation
  const loading = requestPasswordResetMutation.isPending;

  function fail(message, invalid = false) {
    setError({ message, invalid });
    app.showToast(message);
    if (invalid) emailRef.current?.focus();
  }

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    try {
      if (!email.trim()) {
        return fail("Enter your work email first.", true);
      }
      if (!email.includes("@gmail.com")) {
        return fail("Email must end with @gmail.com", true);
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
      // No response means the request never reached the server.
      if (!error.response) {
        return fail(NETWORK_ERROR);
      }
      fail(error.response.data?.message || UNKNOWN_ERROR);
    }
  };

  const emailInvalid = error?.invalid;

  return (
    <AuthLayout>
      <AuthCard
        back
        kicker="Forgot password"
        title="Request a reset"
        description={
          sent
            ? undefined
            : "Password resets are handled by HR. Enter your work email and HR will issue a temporary password."
        }
      >
        {sent ? (
          <div role="status">
            <Notice>
              Your request was sent to the HR Department. HR will issue a temporary password for
              your next sign-in.
            </Notice>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={submit}
            aria-busy={loading}
            aria-describedby={error ? "reset-error" : undefined}
            className="flex flex-col gap-4.5"
          >
            <div className="flex flex-col gap-[5px]">
              <Label htmlFor="reset-email">Work email</Label>
              <Input
                id="reset-email"
                ref={emailRef}
                name="email"
                autoComplete="username"
                inputMode="email"
                value={email}
                placeholder="name@pmcl.ph"
                readOnly={loading}
                aria-invalid={emailInvalid || undefined}
                aria-describedby={emailInvalid ? "reset-error" : undefined}
                className="aria-invalid:border-accent-700"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailInvalid) setError(null);
                }}
              />
            </div>

            {/* Not a live region: the toast already announces the same message. */}
            {error && (
              <div
                id="reset-error"
                className="flex items-start gap-2 border border-accent bg-accent-100 px-3 py-2.5 text-cell leading-snug text-accent-800"
              >
                <CircleAlert size={15} className="mt-[2px] shrink-0" aria-hidden="true" />
                <span>{error.message}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" aria-disabled={loading}>
              {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {loading ? "Sending request..." : "Send request to HR"}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
