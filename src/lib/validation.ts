import { z } from "zod";
import { FOOD_CATEGORY_VALUES } from "@/lib/foods";

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

// --- Profil -------------------------------------------------------------------

export const goalSchema = z.enum(["bulk", "maintain", "cut"], { error: "Choisis ton objectif." });
export const sexSchema = z.enum(["male", "female"], { error: "Choisis une option." });
export const activityLevelSchema = z.enum(
  ["sedentary", "light", "moderate", "active", "very_active"],
  { error: "Choisis ton niveau d'activité." },
);

export const profileSchema = z.object({
  goal: goalSchema,
  sex: sexSchema,
  age: requiredNumber("ton âge", 14, 100),
  heightCm: requiredNumber("ta taille", 100, 250),
  weightKg: requiredNumber("ton poids", 30, 300),
  activityLevel: activityLevelSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;

// --- Aliments -----------------------------------------------------------------

export const foodSchema = z.object({
  name: requiredText("le nom de l'aliment"),
  category: z.enum(FOOD_CATEGORY_VALUES, { error: "Choisis une catégorie." }),
  kcal: optionalNumber(0, 950),
  proteinG: requiredNumber("les protéines", 0, 100),
  carbsG: requiredNumber("les glucides", 0, 100),
  fatG: requiredNumber("les lipides", 0, 100),
});

// --- Recettes -----------------------------------------------------------------

function parseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export const recipeSchema = z.object({
  id: z.preprocess((value) => (value === "" ? undefined : value), uuidSchema.optional()),
  name: requiredText("le nom de la recette"),
  servings: requiredNumber("le nombre de portions", 1, 50).pipe(z.int("Nombre entier attendu.")),
  ingredients: z.preprocess(
    parseJson,
    z
      .array(
        z.object({
          foodId: uuidSchema,
          grams: z.number().positive("Quantité invalide.").max(20000, "20 kg maximum."),
        }),
        { error: "Ingrédients invalides." },
      )
      .min(1, "Ajoute au moins un ingrédient.")
      .max(50, "50 ingrédients maximum."),
  ),
});

// --- Stock et batch cooking ---------------------------------------------------

export const preparationSchema = z.object({
  recipeId: uuidSchema,
  portions: requiredNumber("le nombre de portions", 1, 100).pipe(z.int("Nombre entier attendu.")),
  preparedOn: isoDateSchema,
});

export const batchSettingsSchema = z.object({
  batchesPerWeek: requiredNumber("le nombre de batchs", 1, 7).pipe(z.int("Nombre entier attendu.")),
  stockPortionsPerDay: requiredNumber("le nombre de portions par jour", 0.5, 6),
});
