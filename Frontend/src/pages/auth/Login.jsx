import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleAlert, LoaderCircle } from "lucide-react";
import AuthLayout, { AuthCard } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Field";
import PasswordInput from "../../components/ui/PasswordInput";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { useApp } from "../../hooks/useApp";

const NETWORK_ERROR =
  "Unable to reach the server. Check your connection and try again.";
const UNKNOWN_ERROR = "Sign in failed. Please try again.";

/** Sign in. There is no public registration — accounts are created by HR. */
export default function Login() {
  const { login, showToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // { message, fields } — the message shown in the toast is also kept inline,
  // and `fields` marks which inputs it refers to.
  const [error, setError] = useState(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  function fail(message, fields = []) {
    setError({ message, fields });
    // showToast(message);
    if (fields[0] === "email") emailRef.current?.focus();
    else if (fields[0] === "password") passwordRef.current?.focus();
  }

  async function loginUser(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email || !password) {
      return fail(
        "All fields are required",
        [!email && "email", !password && "password"].filter(Boolean),
      );
    }
    if (!email.includes("@gmail.com") && !email.includes("@pmcl.ph")) {
      return fail("Email must end with @gmail.com or @pmcl.ph", ["email"]);
    }
    try {
      setLoading(true);
      const session = await login(email, password);

      if (!session) {
        return fail("User cannot be fetched");
      }

      if (session.role === "dept-rep") {
        navigate(`/dept/dashboard`);
        showToast(`Welcome back, ${session.username}!`);
        return;
      }
      navigate(`/${session.role}/dashboard`);
      showToast(`Welcome back, ${session.username}!`);
    } catch (error) {
      // No response means the request never reached the server.
      if (!error.response) {
        return fail(NETWORK_ERROR);
      }
      const message = error.response.data?.message;
      if (message === "First-time login user needs to setup new password") {
        return navigate("/first-login");
      }
      fail(message || UNKNOWN_ERROR);
    } finally {
      setLoading(false);
    }
  }

  function clearFieldError(field) {
    if (error?.fields.includes(field)) setError(null);
  }

  const emailInvalid = error?.fields.includes("email");
  const passwordInvalid = error?.fields.includes("password");

  return (
    <AuthLayout>
      <AuthCard
        kicker="Sign in"
        title="Account access"
        description="Use the email and password issued to you by HR."
      >
        <form
          noValidate
          onSubmit={loginUser}
          aria-busy={loading}
          aria-describedby={error ? "login-error" : undefined}
          className="flex flex-col gap-4.5"
        >
          <div className="flex flex-col gap-[5px]">
            <Label htmlFor="login-email">Work email</Label>
            <Input
              id="login-email"
              ref={emailRef}
              name="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              readOnly={loading}
              aria-invalid={emailInvalid || undefined}
              aria-describedby={emailInvalid ? "login-error" : undefined}
              className="aria-invalid:border-accent-700"
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
            />
          </div>

          <div className="flex flex-col gap-[5px]">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Button
                asChild
                variant="link"
                size="inline"
                className="text-meta font-medium"
              >
                <Link to="/forgot-password">Forgot password?</Link>
              </Button>
            </div>
            <PasswordInput
              id="login-password"
              ref={passwordRef}
              name="password"
              autoComplete="current-password"
              value={password}
              readOnly={loading}
              aria-invalid={passwordInvalid || undefined}
              aria-describedby={passwordInvalid ? "login-error" : undefined}
              className="aria-invalid:border-accent-700"
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
            />
          </div>

          {/* Not a live region: the toast already announces the same message. */}
          {error && (
            <div
              id="login-error"
              className="flex items-start gap-2 border border-accent bg-accent-100 px-3 py-2.5 text-cell leading-snug text-accent-800"
            >
              <CircleAlert
                size={15}
                className="mt-[2px] shrink-0"
                aria-hidden="true"
              />
              <span>{error.message}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            aria-disabled={loading}
          >
            {loading && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex flex-col gap-3.5 border-t border-divider pt-4.5">
          {/* <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="text-cell text-ink/60">Have a temporary password?</span>
            <Button asChild variant="outline" size="sm">
              <Link to="/first-login">Set Up / Reset Password</Link>
            </Button>
          </div> */}
          <p className="m-0 text-[11px] leading-relaxed text-ink/50">
            Accounts are created by authorized HR staff &mdash; the system has
            no public sign-up.
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
