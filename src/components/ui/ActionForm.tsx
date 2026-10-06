"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { ActionResult } from "@/lib/action-result";
import { InlineError } from "./States";
import { useToast } from "./Toast";

type FieldErrors = Record<string, string>;

type ActionFormProps<T> = {
  action: (formData: FormData) => Promise<ActionResult<T>>;
  children: ReactNode | ((state: { fieldErrors: FieldErrors; pending: boolean }) => ReactNode);
  className?: string;
  /** Vide le formulaire après succès (par défaut). */
  resetOnSuccess?: boolean;
  /** Affiche le message de succès dans un toast (par défaut). */
  successToast?: boolean;
  onSuccess?: (result: Extract<ActionResult<T>, { ok: true }>) => void;
};

/**
 * Formulaire relié à une Server Action : gère l'envoi, les erreurs par champ,
 * le bandeau d'erreur et le toast de succès. Les saisies sont conservées en cas d'erreur.
 */
export function ActionForm<T>({
  action,
  children,
  className = "flex flex-col gap-4",
  resetOnSuccess = true,
  successToast = true,
  onSuccess,
}: ActionFormProps<T>) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      if (!result) return;
      if (result.ok) {
        setError(null);
        setFieldErrors({});
        if (successToast && result.message) toast.success(result.message);
        if (resetOnSuccess) form.reset();
        onSuccess?.(result);
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-busy={pending} noValidate>
      {error ? <InlineError>{error}</InlineError> : null}
      <fieldset disabled={pending} className="contents">
        {typeof children === "function" ? children({ fieldErrors, pending }) : children}
      </fieldset>
    </form>
  );
}
