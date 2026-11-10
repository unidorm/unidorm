import type { ButtonHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

import { cx } from "../../utils/cx";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap " +
  "transition-colors select-none disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent enabled:hover:bg-accent-strong disabled:opacity-45",
  secondary:
    "border border-border bg-surface-raised text-text enabled:hover:border-border-strong disabled:opacity-45",
  outline:
    "border border-border bg-transparent text-text enabled:hover:bg-surface-raised disabled:opacity-45",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean, extra?: string) {
  return cx(base, variants[variant], sizes[size], fullWidth && "w-full", extra);
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export interface ButtonProps extends CommonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and blocks clicks while an action is running. */
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, fullWidth, className)}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export interface ButtonLinkProps extends CommonProps, Omit<LinkProps, "className"> {
  disabled?: boolean;
  className?: string;
}

/** Button-looking router link, so navigation does not reload the page. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  disabled,
  className,
  children,
  to,
  ...rest
}: ButtonLinkProps) {
  if (disabled) {
    return (
      <span
        role="link"
        aria-disabled="true"
        className={buttonClasses(variant, size, fullWidth, cx("cursor-not-allowed opacity-45", className))}
      >
        {children}
      </span>
    );
  }
  return (
    <Link to={to} className={buttonClasses(variant, size, fullWidth, className)} {...rest}>
      {children}
    </Link>
  );
}
