"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-ink",
  secondary: "bg-primary-soft text-primary",
  ghost: "bg-transparent text-primary",
  danger: "bg-danger-soft text-danger",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-footnote",
  md: "h-control px-4 text-callout",
  lg: "h-12 px-5 text-headline",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} = {}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold",
    "transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-50",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth ? "w-full" : "",
  ].join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  pending?: boolean;
};

export function Button({
  variant,
  size,
  fullWidth,
  pending = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size, fullWidth })} ${className}`}
      disabled={disabled || pending}
      aria-busy={pending}
      {...props}
    >
      {pending ? <Spinner size={18} /> : null}
      {children}
    </button>
  );
}

/** Bouton de soumission : affiche automatiquement l'état d'envoi du formulaire parent. */
export function SubmitButton(props: Omit<ButtonProps, "type" | "pending">) {
  const { pending } = useFormStatus();
  return <Button type="submit" pending={pending} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
};

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`${buttonClasses({ variant, size, fullWidth })} ${className}`}
      {...props}
    />
  );
}
