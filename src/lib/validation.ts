import { z } from "zod";

/** Convertit une saisie texte en nombre (accepte la virgule décimale française). */
function toNumber(value: unknown) {
  if (typeof value !== "string") return value;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  return normalized === "" ? undefined : Number(normalized);
}

/** Nombre obligatoire, borné, avec message en français. */
export function requiredNumber(label: string, min: number, max: number) {
  return z.preprocess(
    toNumber,
    z
      .number({ error: `Indique ${label}.` })
      .refine((value) => Number.isFinite(value), `Indique ${label}.`)
      .refine((value) => value >= min && value <= max, `Entre ${min} et ${max}.`),
  );
}

/** Nombre facultatif (champ vide accepté), borné. */
export function optionalNumber(min: number, max: number) {
  return z.preprocess(
    toNumber,
    z
      .number({ error: "Nombre invalide." })
      .refine((value) => Number.isFinite(value), "Nombre invalide.")
      .refine((value) => value >= min && value <= max, `Entre ${min} et ${max}.`)
      .optional(),
  );
}

export function requiredText(label: string, max = 120) {
  return z
    .string({ error: `Indique ${label}.` })
    .trim()
    .min(1, `Indique ${label}.`)
    .max(max, `${max} caractères maximum.`);
}

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide.");

export const uuidSchema = z.uuid("Identifiant invalide.");

// --- Authentification ---------------------------------------------------------

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Adresse e-mail invalide.")),
  password: z.string().min(8, "8 caractères minimum."),
});

/** Lit un FormData en objet simple (première valeur par clé). */
export function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  const result: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of formData.entries()) {
    if (!(key in result)) result[key] = value;
  }
  return result;
}
