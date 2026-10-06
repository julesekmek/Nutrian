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
export type WorkoutKind = "strength" | "running" | "crossfit" | "other";
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
  /**
   * Équivalents métaboliques (MET) pour estimer une séance quand ses kcal ne sont pas saisies :
   * kcal = MET × poids (kg) × durée (h). Valeurs moyennes du Compendium of Physical Activities.
   */
  workoutMet: { strength: 5, running: 9.8, crossfit: 8, other: 6 } satisfies Record<WorkoutKind, number>,
  /** Écart (kcal) entre apports et dépense en deçà duquel la journée est « à l'équilibre ». */
  balanceToleranceKcal: 150,
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

/** Estimation des kcal d'une séance (si la montre ne donne rien). */
export function estimateWorkoutKcal({
  kind,
  durationMin,
  weightKg,
}: {
  kind: WorkoutKind;
  durationMin: number;
  weightKg: number;
}): number {
  return Math.round(RULES.workoutMet[kind] * weightKg * (durationMin / 60));
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

// --- Stock et batch cooking ----------------------------------------------------

/** Nombre de jours couverts par le stock, au rythme de `portionsPerDay` portions mangées par jour. */
export function stockCoverageDays(stockPortions: number, portionsPerDay: number): number {
  if (portionsPerDay <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, stockPortions) / portionsPerDay;
}

// --- Liste de courses ----------------------------------------------------------

export type PlannedRecipe = {
  /** Portions de la recette telle qu'écrite (ses grammes correspondent à ce nombre de portions). */
  servings: number;
  /** Portions à préparer pour le prochain batch. */
  portionsToPrepare: number;
  ingredients: { foodId: string; grams: number }[];
};

/**
 * Agrège les ingrédients des recettes prévues, mis à l'échelle des portions à préparer.
 * Renvoie les grammes par aliment, arrondis au gramme supérieur (mieux vaut un peu trop que pas assez).
 */
export function aggregateShoppingList(plan: PlannedRecipe[]): Map<string, number> {
  const gramsByFood = new Map<string, number>();
  for (const recipe of plan) {
    if (recipe.portionsToPrepare <= 0) continue;
    const scale = recipe.portionsToPrepare / Math.max(1, recipe.servings);
    for (const ingredient of recipe.ingredients) {
      gramsByFood.set(
        ingredient.foodId,
        (gramsByFood.get(ingredient.foodId) ?? 0) + ingredient.grams * scale,
      );
    }
  }
  for (const [foodId, grams] of gramsByFood) {
    gramsByFood.set(foodId, Math.ceil(grams - 1e-9));
  }
  return gramsByFood;
}

/**
 * Portions à préparer pour tenir jusqu'au prochain batch (règle du coach).
 * - Intervalle entre deux batchs = 7 / batchs par semaine (2 par semaine → 3,5 jours).
 * - `missingNow` : portions qui manquent pour tenir jusqu'au prochain batch (0 si le stock suffit).
 * - `nextBatchPortions` : portions à prévoir au prochain batch pour couvrir l'intervalle suivant.
 */
export function batchPlan({
  stockPortions,
  portionsPerDay,
  batchesPerWeek,
  daysSinceLastBatch,
}: {
  stockPortions: number;
  portionsPerDay: number;
  batchesPerWeek: number;
  /** null si aucune préparation n'a encore été enregistrée. */
  daysSinceLastBatch: number | null;
}) {
  const intervalDays = 7 / Math.max(1, batchesPerWeek);
  const batchDue = daysSinceLastBatch === null || daysSinceLastBatch >= intervalDays;
  const daysUntilNextBatch = batchDue ? intervalDays : intervalDays - daysSinceLastBatch;
  const portionsUntilNextBatch = Math.ceil(daysUntilNextBatch * portionsPerDay - 1e-9);
  const stock = Math.max(0, Math.floor(stockPortions));
  const missingNow = Math.max(0, portionsUntilNextBatch - stock);
  const leftoverAtNextBatch = batchDue ? 0 : Math.max(0, stock - portionsUntilNextBatch);
  const nextBatchPortions = Math.max(
    0,
    Math.ceil(intervalDays * portionsPerDay - 1e-9) - leftoverAtNextBatch,
  );
  return {
    intervalDays,
    batchDue,
    daysUntilNextBatch,
    coveredDays: stockCoverageDays(stock, portionsPerDay),
    missingNow,
    nextBatchPortions,
  };
}

// --- Bilan du jour et recommandations -------------------------------------------

/** Ce qu'il reste à manger pour atteindre la cible (négatif si la cible est atteinte et au-delà). */
export function remainingNutrients(targets: MacroTargets, intake: Nutrients): Nutrients {
  return {
    kcal: targets.kcal - intake.kcal,
    proteinG: targets.proteinG - intake.proteinG,
    carbsG: targets.carbsG - intake.carbsG,
    fatG: targets.fatG - intake.fatG,
  };
}

export type BalanceStatus = "surplus" | "balanced" | "deficit";

/** Bilan énergétique = apports − dépense. */
export function energyBalance(intakeKcal: number, expenditureKcal: number) {
  const kcal = intakeKcal - expenditureKcal;
  const status: BalanceStatus =
    kcal > RULES.balanceToleranceKcal
      ? "surplus"
      : kcal < -RULES.balanceToleranceKcal
        ? "deficit"
        : "balanced";
  return { kcal, status };
}

const EXPECTED_BALANCE: Record<Goal, BalanceStatus> = {
  bulk: "surplus",
  maintain: "balanced",
  cut: "deficit",
};

/** La journée va-t-elle dans le sens de l'objectif (surplus en masse, déficit en sèche, équilibre en maintien) ? */
export function isInPhaseWithGoal(goal: Goal, status: BalanceStatus): boolean {
  return EXPECTED_BALANCE[goal] === status;
}

export type StockDish = { id: string; name: string; perServing: Nutrients; portionsLeft: number };

/**
 * Plat du stock qui comble le mieux le manque du jour sans dépasser les kcal restantes.
 * Score = part des protéines restantes couverte + part des kcal restantes couverte.
 */
export function suggestDishFromStock(remaining: Nutrients, dishes: StockDish[]): StockDish | null {
  if (remaining.kcal <= 0) return null;
  const coverage = (value: number, needed: number) =>
    needed > 0 ? Math.min(value, needed) / needed : 0;

  let best: { dish: StockDish; score: number } | null = null;
  for (const dish of dishes) {
    if (dish.portionsLeft < 1 || dish.perServing.kcal > remaining.kcal) continue;
    const score =
      coverage(dish.perServing.proteinG, remaining.proteinG) +
      coverage(dish.perServing.kcal, remaining.kcal);
    const isBetter =
      !best ||
      score > best.score + 1e-9 ||
      (Math.abs(score - best.score) <= 1e-9 && dish.perServing.proteinG > best.dish.perServing.proteinG);
    if (isBetter) best = { dish, score };
  }
  return best?.dish ?? null;
}
