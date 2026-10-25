import { useState } from "react";
import { Check, Circle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import PasswordInput from "../components/ui/PasswordInput";
import { useApp } from "../hooks/useApp";
import { useUpdateOwnUserPass } from "../hooks/useUsers";
import { cx } from "../lib/cx";

/** Same minimum length HR Settings and first login use. */
const MIN_LENGTH = 6;

/**
 * Settings for employees and department representatives — change password
 * only. Uses the same update-own-password call and rules as HR Settings.
 */
export default function AccountSettings() {
  const app = useApp();
  const [currentPass, setCurrentPass] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const updateOwnUserPasswordMutation = useUpdateOwnUserPass(
    app.session.accessToken,
  );
  const saving = updateOwnUserPasswordMutation.isPending;

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (next.length < MIN_LENGTH) {
      app.showToast(
        `Use at least ${MIN_LENGTH} characters for the new password.`,
      );
      return;
    }
    if (next !== confirm) {
      app.showToast("The two passwords do not match.", { type: "error" });
      return;
    }
    try {
      await updateOwnUserPasswordMutation.mutateAsync({
        currentPass: currentPass,
        password: next,
      });

      app.showToast("Password updated", { type: "success" });
    } catch (error) {
      console.log("Failed updating password", error);
      app.showToast(error.response.data.message, {
        type: "error",
      });
    } finally {
      setCurrentPass("");
      setNext("");
      setConfirm("");
    }
  };

  return (
    <Card padding="lg" className="gap-4">
      <div>
        <h4 className="text-[20px]">Change password</h4>
        <p className="m-0 mt-1 text-cell text-ink/60">
          Choose a new password for signing in to your account.
        </p>
      </div>

      <form noValidate onSubmit={save} className="flex flex-col gap-3.5">
        <Field label="Current password">
          <PasswordInput
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            readOnly={saving}
            autoComplete="new-password"
            aria-describedby="account-password-rules"
          />
        </Field>
        <Field label="New password">
          <PasswordInput
            value={next}
            onChange={(e) => setNext(e.target.value)}
            readOnly={saving}
            autoComplete="new-password"
            aria-describedby="account-password-rules"
          />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            readOnly={saving}
            autoComplete="new-password"
          />
        </Field>

        {/* Mirrors the checks in save(); it does not enforce anything itself. */}
        <ul
          id="account-password-rules"
          className="m-0 flex list-none flex-col gap-1.5 p-0"
        >
          {[
            [`At least ${MIN_LENGTH} characters`, next.length >= MIN_LENGTH],
            ["Both passwords match", confirm !== "" && next === confirm],
          ].map(([label, met]) => (
            <li
              key={label}
              className={cx(
                "flex items-center gap-2 text-meta transition-colors motion-reduce:transition-none",
                met ? "text-accent-700" : "text-ink/55",
              )}
            >
              {met ? (
                <Check size={14} className="shrink-0" aria-hidden="true" />
              ) : (
                <Circle
                  size={14}
                  className="shrink-0 opacity-60"
                  aria-hidden="true"
                />
              )}
              <span>
                {label}
                <span className="sr-only">
                  {met ? " (met)" : " (not met yet)"}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          variant="primary"
          className="mt-1 self-start max-sm:min-h-11 max-sm:self-stretch"
          disabled={!currentPass || !next || !confirm || saving}
        >
          {saving ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </Card>
  );
}
