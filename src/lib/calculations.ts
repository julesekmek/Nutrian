/**
 * Module de calcul Nutrian : TOUTES les règles chiffrées de l'app sont ici.
 *
 * - Module pur (aucune dépendance, aucun accès réseau), utilisable côté serveur et navigateur.
 * - Testé par `calculations.test.ts` (`npm test`).
 * - Pour changer une règle, modifier `RULES` ou la fonction concernée, puis lancer les tests.
 *
 * Les cibles produites sont des estimations, pas un avis médical.
 */

export type Sex = "male" | "female";
export type Goal = "bulk" | "maintain" | "cut";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export const RULES = {
  /** Mifflin-St Jeor : 10 × poids (kg) + 6,25 × taille (cm) − 5 × âge + constante selon le sexe. */
  mifflinStJeor: { perKg: 10, perCm: 6.25, perYear: 5, male: 5, female: -161 },
  /** Vie quotidienne hors sport, appliquée au métabolisme de base quand l'activité du jour est saisie. */
  dailyLifeFactor: 1.2,
  /** Dépense des pas : pas × 0,0005 × poids (kg). */
  kcalPerStepPerKg: 0.0005,
  /** Niveau d'activité déclaré : utilisé quand rien n'est saisi pour la journée. */
  activityFactors: {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  } satisfies Record<ActivityLevel, number>,
  /** Ajustement de la cible kcal selon l'objectif. */
  goalAdjustmentKcal: { bulk: 300, maintain: 0, cut: -400 } satisfies Record<Goal, number>,
  /** Protéines en g par kg de poids. */
  proteinPerKg: { bulk: 2, maintain: 2, cut: 2.2 } satisfies Record<Goal, number>,
  /** Lipides en g par kg de poids. */
  fatPerKg: 1,
  /** Énergie par gramme de macronutriment. */
  kcalPerGram: { protein: 4, carbs: 4, fat: 9 },
} as const;

// --- Profil, métabolisme et dépense ------------------------------------------

export type BodyProfile = {
  sex: Sex;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export function ageFromBirthYear(birthYear: number, currentYear: number): number {
  return Math.max(0, currentYear - birthYear);
}

/** Métabolisme de base (kcal/jour), formule de Mifflin-St Jeor. */
export function basalMetabolicRate({
  sex,
  weightKg,
  heightCm,
  ageYears,
}: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const f = RULES.mifflinStJeor;
  return f.perKg * weightKg + f.perCm * heightCm - f.perYear * ageYears + f[sex];
}

/** Activité saisie pour une journée. `steps: null` = pas non saisis. */
export type DayActivity = {
  steps: number | null;
  workouts: { kcal: number }[];
};

export type Expenditure = {
  totalKcal: number;
  /** "logged" : calculée depuis la saisie du jour ; "estimated" : depuis le niveau d'activité déclaré. */
  method: "logged" | "estimated";
  bmrKcal: number;
  stepsKcal: number;
  workoutsKcal: number;
};

export function hasLoggedActivity(activity: DayActivity | undefined): boolean {
  return Boolean(activity && (activity.steps !== null || activity.workouts.length > 0));
}

/**
 * Dépense du jour.
 * - Activité saisie : métabolisme de base × 1,2 + pas × 0,0005 × poids + kcal des séances.
 * - Rien de saisi : métabolisme de base × facteur du niveau d'activité déclaré.
 */
export function dailyExpenditure({
  bmrKcal,
  weightKg,
  activityLevel,
  activity,
}: {
  bmrKcal: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  activity?: DayActivity;
}): Expenditure {
  if (!activity || !hasLoggedActivity(activity)) {
    return {
      totalKcal: bmrKcal * RULES.activityFactors[activityLevel],
      method: "estimated",
      bmrKcal,
      stepsKcal: 0,
      workoutsKcal: 0,
    };
  }
  const stepsKcal = (activity.steps ?? 0) * RULES.kcalPerStepPerKg * weightKg;
  const workoutsKcal = activity.workouts.reduce((sum, workout) => sum + workout.kcal, 0);
  return {
    totalKcal: bmrKcal * RULES.dailyLifeFactor + stepsKcal + workoutsKcal,
    method: "logged",
    bmrKcal,
    stepsKcal,
    workoutsKcal,
  };
}

export type MacroTargets = { kcal: number; proteinG: number; carbsG: number; fatG: number };

/**
 * Cible du jour : dépense + ajustement selon l'objectif ;
 * protéines 2 g/kg (2,2 en perte de gras), lipides 1 g/kg, glucides = le reste des kcal.
 */
export function macroTargets({
  goal,
  weightKg,
  expenditureKcal,
}: {
  goal: Goal;
  weightKg: number;
  expenditureKcal: number;
}): MacroTargets {
  const kcal = Math.round(expenditureKcal + RULES.goalAdjustmentKcal[goal]);
  const proteinG = Math.round(RULES.proteinPerKg[goal] * weightKg);
  const fatG = Math.round(RULES.fatPerKg * weightKg);
  const remainingKcal =
    kcal - proteinG * RULES.kcalPerGram.protein - fatG * RULES.kcalPerGram.fat;
  const carbsG = Math.max(0, Math.round(remainingKcal / RULES.kcalPerGram.carbs));
  return { kcal, proteinG, carbsG, fatG };
}

export type DayPlan = { bmrKcal: number; expenditure: Expenditure; targets: MacroTargets };

/** Raccourci : métabolisme de base → dépense du jour → cible du jour. */
export function computeDayPlan(
  profile: BodyProfile,
  currentYear: number,
  activity?: DayActivity,
): DayPlan {
  const bmrKcal = basalMetabolicRate({
    sex: profile.sex,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    ageYears: ageFromBirthYear(profile.birthYear, currentYear),
  });
  const expenditure = dailyExpenditure({
    bmrKcal,
    weightKg: profile.weightKg,
    activityLevel: profile.activityLevel,
    activity,
  });
  const targets = macroTargets({
    goal: profile.goal,
    weightKg: profile.weightKg,
    expenditureKcal: expenditure.totalKcal,
  });
  return { bmrKcal, expenditure, targets };
}

// --- Aliments -----------------------------------------------------------------

export type Nutrients = { kcal: number; proteinG: number; carbsG: number; fatG: number };

export const ZERO_NUTRIENTS: Nutrients = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };

/** Énergie déduite des macros (4 / 4 / 9 kcal par gramme). */
export function kcalFromMacros({ proteinG, carbsG, fatG }: Omit<Nutrients, "kcal">): number {
  const k = RULES.kcalPerGram;
  return proteinG * k.protein + carbsG * k.carbs + fatG * k.fat;
}

/** Apports d'une quantité d'aliment, à partir de ses valeurs pour 100 g. */
export function nutrientsForGrams(per100g: Nutrients, grams: number): Nutrients {
  const ratio = grams / 100;
  return {
    kcal: per100g.kcal * ratio,
    proteinG: per100g.proteinG * ratio,
    carbsG: per100g.carbsG * ratio,
    fatG: per100g.fatG * ratio,
  };
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  return items.reduce(
    (total, item) => ({
      kcal: total.kcal + item.kcal,
      proteinG: total.proteinG + item.proteinG,
      carbsG: total.carbsG + item.carbsG,
      fatG: total.fatG + item.fatG,
    }),
    ZERO_NUTRIENTS,
  );
}

export function scaleNutrients(nutrients: Nutrients, factor: number): Nutrients {
  return {
    kcal: nutrients.kcal * factor,
    proteinG: nutrients.proteinG * factor,
    carbsG: nutrients.carbsG * factor,
    fatG: nutrients.fatG * factor,
  };
}

// --- Recettes -----------------------------------------------------------------

export type IngredientInput = { grams: number; per100g: Nutrients };

export type RecipeNutrition = { total: Nutrients; perServing: Nutrients };

/** Macros totales d'une recette et par portion (portions ≥ 1). */
export function recipeNutrition(ingredients: IngredientInput[], servings: number): RecipeNutrition {
  const total = sumNutrients(
    ingredients.map((ingredient) => nutrientsForGrams(ingredient.per100g, ingredient.grams)),
  );
  return { total, perServing: scaleNutrients(total, 1 / Math.max(1, servings)) };
}
