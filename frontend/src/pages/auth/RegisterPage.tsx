import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { Button, FormMessage, Input } from "../../components/ui";
import { ROUTES } from "../../config/routes";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../services/apiClient";

type Field = "fullName" | "email" | "password" | "confirm";

/** Same rules as the backend (app/schemas/auth.py), checked here first for quick feedback. */
function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (values.fullName.trim().split(/\s+/).join(" ").length < 2) errors.fullName = "Enter your full name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (values.password.length < 8) errors.password = "Use at least 8 characters.";
  else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password))
    errors.password = "Use at least one letter and one number.";
  if (values.confirm !== values.password) errors.confirm = "The passwords do not match.";
  return errors;
}

export default function RegisterPage() {
  const { register, status } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<Field, string>>({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set just before a successful registration, so the redirect below carries the welcome message.
  const justRegistered = useRef(false);

  if (status === "signed-in") {
    return <Navigate to={ROUTES.student.home} replace state={justRegistered.current ? { welcome: true } : undefined} />;
  }

  const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      justRegistered.current = true;
      await register(values.fullName.trim(), values.email.trim(), values.password);
      navigate(ROUTES.student.home, { replace: true, state: { welcome: true } });
    } catch (error) {
      justRegistered.current = false;
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="For KBTU students who apply for a room in Jastar City.">
      <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
        {formError && <FormMessage tone="danger">{formError}</FormMessage>}
        <Input id="register-name" label="Full name" autoComplete="name" placeholder="Aliya Serikova"
          value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
        <Input id="register-email" label="Email" type="email" autoComplete="email" placeholder="name@kbtu.kz"
          value={values.email} onChange={set("email")} error={errors.email} />
        <Input id="register-password" label="Password" type="password" autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number." value={values.password}
          onChange={set("password")} error={errors.password} />
        <Input id="register-confirm" label="Repeat password" type="password" autoComplete="new-password"
          value={values.confirm} onChange={set("confirm")} error={errors.confirm} />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
        <p className="text-center text-sm text-muted">
          Already registered?{" "}
          <Link to={ROUTES.auth.login} className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
