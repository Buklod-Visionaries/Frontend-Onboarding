import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, CircleAlert, LoaderCircle } from "lucide-react";
import AuthLayout, { AuthCard } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Field";
import { SectionHeading } from "../../components/ui/Notice";
import { cx } from "../../lib/cx";
import PasswordInput from "../../components/ui/PasswordInput";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { useApp } from "../../hooks/useApp";

const NETWORK_ERROR = "Unable to reach the server. Check your connection and try again.";
const UNKNOWN_ERROR = "Password update failed. Please try again.";

/** First-time login: the temporary password issued by HR is replaced here. */
export default function FirstLogin() {
  const app = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [loading, setLoading] = useState(false);
  // { message, field } — the message shown in the toast is also kept inline,
  // and `field` marks the input it refers to.
  const [error, setError] = useState(null);

  function fail(message, field) {
    setError({ message, field });
    app.showToast(message);
    if (field) document.getElementById(`first-login-${field}`)?.focus();
  }

  async function saveAndLogin(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email.includes("@gmail.com")) {
      return fail("Email must end with @gmail.com", "email");
    }
    if (newPass.length < 6) {
      return fail("Use at least 6 characters for the new password.", "newPass");
    }
    if (tempPass === newPass) {
      return fail("New password must be different from the temporary password", "newPass");
    }
    if (newPass !== confirmNewPass) {
      return fail("Confirm password do not match", "confirmNewPass");
    }
    try {
      setLoading(true);

      //access the first login api in appstore
      const session = await app.firstLogin(email, tempPass, newPass);

      if (!session) {
        return fail("User cannot be fetched");
      }

      //
      app.showToast(`Password updated — signed in as ${session.username}`);

      //its manual since db role is different from routing name
      if (session.role === "dept-rep") {
        return navigate(`/dept/dashboard`);
      }
      navigate(`/${session.role}/dashboard`);
    } catch (error) {
      // No response means the request never reached the server.
      if (!error.response) {
        return fail(NETWORK_ERROR);
      }
      const message = error.response.data?.message;
      fail(message ? `Error Login: ${message}` : UNKNOWN_ERROR);
    } finally {
      setLoading(false);
    }
  }

  /** Props shared by every input: id, invalid state, and error wiring. */
  function fieldProps(field, value, setValue) {
    const invalid = error?.field === field;
    return {
      id: `first-login-${field}`,
      name: field,
      value,
      readOnly: loading,
      "aria-invalid": invalid || undefined,
      "aria-describedby": invalid ? "first-login-error" : undefined,
      className: "aria-invalid:border-accent-700",
      onChange: (e) => {
        setValue(e.target.value);
        if (invalid) setError(null);
      },
    };
  }

  return (
    <AuthLayout>
      <AuthCard
        back
        kicker="Set Up / Reset Password"
        title="Set a new password"
        description="Enter your account credentials and choose a new password to activate your account or complete a requested password reset."
      >
        <form
          noValidate
          onSubmit={saveAndLogin}
          aria-busy={loading}
          aria-describedby={error ? "first-login-error" : undefined}
          className="flex flex-col gap-4.5"
        >
          <fieldset className="m-0 flex min-w-0 flex-col gap-4.5 border-0 p-0">
            <legend className="mb-4.5 w-full p-0">
              <SectionHeading step="01">Your account</SectionHeading>
            </legend>
            <div className="flex flex-col gap-[5px]">
              <Label htmlFor="first-login-email">Work email</Label>
              <Input
                {...fieldProps("email", email, setEmail)}
                autoComplete="username"
                inputMode="email"
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <Label htmlFor="first-login-tempPass">Temporary password</Label>
              <PasswordInput
                {...fieldProps("tempPass", tempPass, setTempPass)}
                autoComplete="current-password"
              />
            </div>
          </fieldset>

          <fieldset className="m-0 mt-3 flex min-w-0 flex-col gap-4.5 border-0 p-0">
            <legend className="mb-4.5 w-full p-0">
              <SectionHeading step="02">New password</SectionHeading>
            </legend>
            <div className="flex flex-col gap-[5px]">
              <Label htmlFor="first-login-newPass">New password</Label>
              <PasswordInput
                {...fieldProps("newPass", newPass, setNewPass)}
                autoComplete="new-password"
                aria-describedby={
                  error?.field === "newPass" ? "first-login-error" : "first-login-requirements"
                }
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <Label htmlFor="first-login-confirmNewPass">Confirm new password</Label>
              <PasswordInput
                {...fieldProps("confirmNewPass", confirmNewPass, setConfirmNewPass)}
                autoComplete="new-password"
              />
            </div>

            {/* Mirrors the existing rules in saveAndLogin; it does not enforce them. */}
            <ul id="first-login-requirements" className="m-0 flex list-none flex-col gap-1.5 p-0">
              {[
                ["At least 6 characters", newPass.length >= 6],
                ["Different from the temporary password", newPass !== "" && newPass !== tempPass],
                ["Matches the confirmation", confirmNewPass !== "" && newPass === confirmNewPass],
              ].map(([label, met]) => (
                <li
                  key={label}
                  className={cx(
                    "flex items-center gap-2 text-meta transition-colors motion-reduce:transition-none",
                    met ? "text-accent-700" : "text-ink/50",
                  )}
                >
                  {met ? (
                    <Check size={14} className="shrink-0" aria-hidden="true" />
                  ) : (
                    <Circle size={14} className="shrink-0 opacity-60" aria-hidden="true" />
                  )}
                  <span>
                    {label}
                    <span className="sr-only">{met ? " (met)" : " (not met yet)"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          {/* Not a live region: the toast already announces the same message. */}
          {error && (
            <div
              id="first-login-error"
              className="flex items-start gap-2 border border-accent bg-accent-100 px-3 py-2.5 text-cell leading-snug text-accent-800"
            >
              <CircleAlert size={15} className="mt-[2px] shrink-0" aria-hidden="true" />
              <span>{error.message}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="mt-1 w-full" aria-disabled={loading}>
            {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {loading ? "Saving new password..." : "Save password & continue"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
