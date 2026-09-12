import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Field, Input, Radio } from "../../components/ui/Field";
import { useApp } from "../../hooks/useApp";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { useDepartmentScope } from "../../hooks/useDepartmentScope";
import api from "../../lib/axios";

const EMAILS = {
  HR: "g.aquino@pmcl.ph",
  Employee: "m.bautista@pmcl.ph",
  Department: "l.tanguilig@pmcl.ph",
};

const ROLES = [
  ["HR", "HR Staff"],
  ["Employee", "Employee"],
  ["Department", "Department Representative"],
];

/** Sign in. There is no public registration — accounts are created by HR. */
export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginUser(e) {
    e.preventDefault();

    if (!email || !password) {
      return alert("All fields are required");
    }
    if (!email.includes("@gmail.com")) {
      return alert("Email must end with @gmail.com");
    }
    try {
      setLoading(true);
      const session = await login(email, password);

      if (!session) {
        return alert("User cannot be fetched");
      }
      if (session.role === "dept-rep") {
        return navigate(`/dept/dashboard`);
      }
      navigate(`/${session.role}/dashboard`);
      console.log("SESSION:", session);
      console.log("ROLE:", session?.role);
    } catch (error) {
      alert(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card padding="lg" className="w-full max-w-[400px] gap-5">
        <div>
          <div className="font-heading text-kicker uppercase text-accent-700">
            Sign in
          </div>
          <h2 className="mt-1.5 text-[30px]">Account access</h2>
        </div>

        {/* <div className="flex flex-col gap-2.5">
          <span className="text-meta text-ink/70">Select role for this demo</span>
          {ROLES.map(([value, label]) => (
            <Radio
              key={value}
              name="login-role"
              checked={role === value}
              onChange={() => setRole(value)}
            >
              {label}
            </Radio>
          ))}
        </div> */}

        <Field label="Work email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Button
          variant="primary"
          block
          className="h-[42px]"
          onClick={(e) => loginUser(e)}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <p className="m-0 text-center text-[11px] leading-relaxed text-ink/50">
          Credentials are pre-filled for the prototype. Accounts are created by
          authorized HR staff &mdash; the system has no public sign-up.
        </p>

        <div className="flex flex-wrap justify-center gap-1.5">
          <Link to="/first-login">
            <Button variant="ghost">First-time login</Button>
          </Link>
          <Link to="/forgot-password">
            <Button variant="ghost">Forgot password</Button>
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
