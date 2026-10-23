import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Field, Input, Select } from "../../components/ui/Field";
import { useApp } from "../../hooks/useApp";
//
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateOwnUserPass } from "../../hooks/useUsers";
import {
  useFetchSystemSettings,
  useUpdateSystemSettings,
} from "../../hooks/useSystemSettings";

const DEADLINE_OPTIONS = [
  { value: 7, label: "7 days from start date" },
  { value: 10, label: "10 days from start date" },
  { value: 14, label: "14 days from start date" },
];

const REMINDER_OPTIONS = [
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 5, label: "5 days before" },
];

export default function Settings() {
  const app = useApp();
  const queryClient = useQueryClient();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  //fetch system settings hook
  const {
    data: systemSettings = [],
    isLoading: systemSettingsLoading,
    isError: systemSettingsError,
  } = useFetchSystemSettings(app.session.accessToken);
  const [deadlineDays, setDeadlineDays] = useState(systemSettings.deadlineDays);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    systemSettings.reminderDaysBefore,
  );
  //update own user pass hook
  const updateOwnUserPasswordMutation = useUpdateOwnUserPass(
    app.session.accessToken,
  );
  //update system settings hook
  const {
    mutateAsync: updateSystemSettingsMutation,
    isPending: updateSystemSettingsPending,
  } = useUpdateSystemSettings(app.session.accessToken);

  const save = async () => {
    if (next.length < 6) {
      app.showToast("Use at least 6 characters for the new password.");
      return;
    }
    if (next !== confirm) {
      app.showToast("The two passwords do not match.", {
        type: "error",
      });
      return;
    }
    //update the password by passing password in the mutation
    await updateOwnUserPasswordMutation.mutateAsync(next); //next is the name of useState variable where password is set
    setNext("");
    setConfirm("");
    app.showToast("Password updated");
  };

  const setSetting = (key) => (e) => {
    const { value } = e.target;
    app.setSettings((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (systemSettings) {
      setDeadlineDays(systemSettings.deadlineDays);
      setReminderDaysBefore(systemSettings.reminderDaysBefore);
    }
  }, [systemSettings]);

  if (systemSettingsLoading) {
    return <LoadingState />;
  }

  if (systemSettingsError) {
    return <ErrorState>Failed loading system settings.</ErrorState>;
  }

  console.log(systemSettings);
  // One card per row: Account & profile above System Settings.
  return (
    <div className="flex flex-col gap-5">
      <Card padding="lg" className="gap-4">
        <h4 className="text-[20px]">Account &amp; profile</h4>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={app.session.username} readOnly />
          </Field>
          <Field label="Work email">
            <Input value={app.session.email} readOnly />
          </Field>
        </div>
        <Field label="New password">
          <Input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <Button
          variant="primary"
          className="self-start max-sm:self-stretch"
          onClick={save}
          disabled={!next || !confirm}
        >
          Update password
        </Button>
      </Card>

      <Card padding="lg" className="gap-4">
        <h4 className="text-[20px]">System Settings</h4>
        <Field label="Default deadline for document requirements">
          <Select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            options={DEADLINE_OPTIONS}
          />
        </Field>
        <Field label="Reminder notice before a deadline">
          <Select
            value={reminderDaysBefore}
            onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
            options={REMINDER_OPTIONS}
          />
        </Field>
        <p className="m-0 text-meta leading-relaxed text-ink/55">
          Applies to newly assigned requirements. Existing deadlines are
          unchanged.
        </p>
        <Button
          variant="primary"
          className="self-start max-sm:self-stretch"
          onClick={async () => {
            try {
              await updateSystemSettingsMutation({
                deadlineDays,
                reminderDaysBefore,
              });
            } catch (error) {
              app.showToast("Failed updating system settings");
              console.log("Error updating system settings, ", error);
            }
          }}
          disabled={
            (deadlineDays === systemSettings.deadlineDays &&
              reminderDaysBefore === systemSettings.reminderDaysBefore) ||
            updateSystemSettingsPending
          }
        >
          Save Settings
        </Button>
      </Card>
    </div>
  );
}
