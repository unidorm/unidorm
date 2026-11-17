import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { Button, FormMessage, Input } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../services/apiClient";

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.student.home;
  const expired = new URLSearchParams(location.search).get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "signed-in") return <Navigate to={from} replace />;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Enter your email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Use the email and password of your UniDorm account.">
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        {expired && !formError && <FormMessage tone="info">Your session has ended. Please sign in again.</FormMessage>}
        {formError && <FormMessage tone="danger">{formError}</FormMessage>}
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@kbtu.kz"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Sign in
        </Button>
        <p className="text-center text-sm text-muted">
          New to UniDorm?{" "}
          <Link to={ROUTES.auth.register} state={location.state} className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
