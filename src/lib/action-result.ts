import type { ZodError } from "zod";

/** Résultat standard d'une Server Action, affiché par <ActionForm> ou un toast. */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function success<T = undefined>(message?: string, data?: T): ActionResult<T> {
  return { ok: true, message, data };
}

export function failure(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Transforme une erreur de validation Zod en erreurs par champ (premier message par champ). */
export function validationFailure(error: ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return failure("Vérifie les champs en rouge.", fieldErrors);
}

export const GENERIC_ERROR = "Ça n'a pas pu être enregistré. Réessaie dans un instant.";
