import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { useApp } from "../../hooks/useApp";
//
import api from "../../lib/axios";

/** First-time login: the temporary password issued by HR is replaced here. */
export default function FirstLogin() {
  const app = useApp();
  const navigate = useNavigate();
  // const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveAndLogin(e) {
    e.preventDefault();
    if (!email.includes("@gmail.com")) {
      return alert("Email must end with @gmail.com");
    }
    if (newPass.length < 6) {
      app.showToast("Use at least 6 characters for the new password.");
      return;
    }
    if (tempPass === newPass) {
      app.showToast(
        "New password must be different from the temporary password",
      );
      return;
    }
    if (newPass !== confirmNewPass) {
      app.showToast("The two passwords do not match.");
      return;
    }
    try {
      setLoading(true);

      //access the first login api in appstore
      const session = await app.firstLogin(email, tempPass, newPass);

      if (!session) {
        return alert("User cannot be fetched");
      }

      //
      app.showToast(`Password updated — signed in as ${session.username}`);

      //its manual since db role is different from routing name
      if (session.role === "dept-rep") {
        return navigate(`/dept/dashboard`);
      }
      navigate(`/${session.role}/dashboard`);
    } catch (error) {
      app.showToast(`Error Login: ${error.response.data.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">
            First-time login
          </div>
          <h2 className="mt-1.5 text-[30px]">Set your password</h2>
        </div>

        <p className="m-0 text-cell leading-relaxed text-ink/65">
          Your account was created by HR with a temporary password. Set a new
          password to continue to your onboarding requirements.
        </p>
        <Field label="Work email">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </Field>
        <Field label="Temporary password">
          <Input
            type="password"
            value={tempPass}
            onChange={(e) => {
              setTempPass(e.target.value);
            }}
          />
        </Field>
        <Field label="New password">
          <Input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            value={confirmNewPass}
            onChange={(e) => setConfirmNewPass(e.target.value)}
          />
        </Field>

        <Button
          variant="primary"
          block
          className="h-[42px]"
          onClick={(e) => saveAndLogin(e)}
        >
          Save password &amp; continue
        </Button>

        <Link to="/login" className="self-center">
          <Button variant="ghost">Back to sign in</Button>
        </Link>
      </Card>
    </AuthLayout>
  );
}
