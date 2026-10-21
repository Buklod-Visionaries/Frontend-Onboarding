import { useState } from "react";
import {
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import PasswordInput from "../../ui/PasswordInput";
import { cx } from "../../../lib/cx";
import { useFirstLogin } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/hooks/useApp";

/** Same minimum length the first-login screen enforces. */
const MIN_LENGTH = 6;

/**
 * Required first-time password change, shown over the dashboard after signing
 * in with a temporary password. It can't be dismissed until it's done.
 *
 * UI only: `onSubmit(newPassword)` does the real work and should throw to show
 * an error. When it resolves, the success view appears and `onDone` closes it.
 * `preview` labels the success view as a design preview (nothing was saved).
 */
export default function SetPasswordDialog({
  currentUser,
  open,
  onSubmit,
  onDone,
  preview,
}) {
  if (!open) return null;
  return (
    <SetPasswordDialogBody
      currentUser={currentUser}
      onSubmit={onSubmit}
      onDone={onDone}
      preview={preview}
    />
  );
}

function SetPasswordDialogBody({ currentUser, onSubmit, onDone, preview }) {
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const app = useApp();
  const queryClient = useQueryClient();
  // Errors appear after the first submit, then update as the user types.
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const firstLoginMutation = useFirstLogin(app.session.accessToken);

  const errors = {
    newPass: !newPass
      ? "Enter a new password."
      : newPass.length < MIN_LENGTH
        ? `Use at least ${MIN_LENGTH} characters.`
        : "",
    confirmPass: !confirmPass
      ? "Re-enter the new password."
      : confirmPass !== newPass
        ? "Passwords don't match."
        : "",
  };
  const shown = submitted ? errors : {};

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setSubmitted(true);
    setSubmitError("");
    if (errors.newPass || errors.confirmPass) {
      document
        .getElementById(
          errors.newPass ? "set-password-new" : "set-password-confirm",
        )
        ?.focus();
      return;
    }
    setLoading(true);
    try {
      //set up new password
      await firstLoginMutation.mutateAsync({
        email: currentUser.email,
        tempPass: currentUser.password,
        newPass: newPass,
      });

      setDone(true);
    } catch (error) {
      setSubmitError(
        error?.response.data.message ||
          "Password update failed. Please try again.",
      );
      console.log(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  const kicker = (
    <span className="mb-1.5 flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center bg-accent-100 text-accent-700">
        {done ? (
          <CircleCheck size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <LockKeyhole size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </span>
      Account security
    </span>
  );

  if (done) {
    return (
      <Modal
        open
        dismissible={false}
        width="max-w-[440px]"
        kicker={kicker}
        title="Password updated"
        subtitle="Your new password is set. Use it the next time you sign in."
        actions={
          <Button
            variant="primary"
            className="w-full min-h-11 text-[15px]"
            onClick={onDone}
          >
            Continue to dashboard
          </Button>
        }
      ></Modal>
    );
  }

  return (
    <Modal
      open
      dismissible={false}
      width="max-w-[440px]"
      kicker={kicker}
      title="Set a New Password"
      subtitle="For your account's security, please replace your temporary password before continuing."
      actions={
        <Button
          type="submit"
          form="set-password-form"
          variant="primary"
          // Full width so it reads as the one way forward.
          className="w-full min-h-11 text-[15px]"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && (
            <LoaderCircle
              size={16}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {loading ? "Updating password..." : "Update Password"}
        </Button>
      }
    >
      <form
        id="set-password-form"
        noValidate
        onSubmit={submit}
        className="flex flex-col gap-4 pt-1"
      >
        <PasswordField
          id="set-password-new"
          label="New Password"
          value={newPass}
          onChange={setNewPass}
          error={shown.newPass}
          readOnly={loading}
          describedBy="set-password-rules"
        />
        <PasswordField
          id="set-password-confirm"
          label="Confirm New Password"
          value={confirmPass}
          onChange={setConfirmPass}
          error={shown.confirmPass}
          readOnly={loading}
        />

        {/* The existing first-login rules. Length and match are checked live;
            "different from the temporary password" is only verified by the server. */}
        <ul
          id="set-password-rules"
          className="m-0 flex list-none flex-col gap-1.5 border-t border-divider p-0 pt-3.5"
        >
          {[
            [`At least ${MIN_LENGTH} characters`, newPass.length >= MIN_LENGTH],
            [
              "Both passwords match",
              confirmPass !== "" && newPass === confirmPass,
            ],
            [
              "Different from your temporary password",
              confirmPass !== "" &&
                newPass === confirmPass &&
                newPass !== currentUser.password,
            ],
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
                {met !== null && (
                  <span className="sr-only">
                    {met ? " (met)" : " (not met yet)"}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-accent bg-accent-100 px-3 py-2.5 text-cell leading-snug text-accent-800"
          >
            <CircleAlert
              size={15}
              className="mt-[2px] shrink-0"
              aria-hidden="true"
            />
            <span>{submitError}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}

/** Label + PasswordInput (with its show/hide toggle) + inline error. */
function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  readOnly,
  describedBy,
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={id} className="text-meta text-ink/70">
        {label}
      </label>
      <PasswordInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        autoComplete="new-password"
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [error && errorId, describedBy].filter(Boolean).join(" ") || undefined
        }
        className="min-h-10 aria-invalid:border-accent-700 aria-invalid:bg-accent-100/60 max-sm:min-h-11"
      />
      {error && (
        <span
          id={errorId}
          className="flex items-center gap-1.5 text-meta text-accent-800"
        >
          <CircleAlert size={13} className="shrink-0" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}
