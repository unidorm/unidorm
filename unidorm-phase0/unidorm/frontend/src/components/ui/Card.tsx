import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";

type CardVariant = "default" | "raised" | "sunken";
type CardPadding = "none" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  default: "bg-surface border-border",
  raised: "bg-surface-raised border-border-strong/60",
  sunken: "bg-surface-sunken border-border",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Content aligned to the right of the title row (a pill, a button). */
  actions?: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
}

export default function Card({
  eyebrow,
  title,
  description,
  actions,
  variant = "default",
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(eyebrow || title || description || actions);
  return (
    <section
      className={cx("rounded-card border", variants[variant], paddings[padding], className)}
      {...rest}
    >
      {hasHeader && (
        <header className={cx("flex items-start justify-between gap-4", Boolean(children) && "mb-4")}>
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
            {title && <h2 className="font-display text-lg font-semibold leading-snug">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
