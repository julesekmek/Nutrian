import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateShoppingList,
  ageFromBirthYear,
  batchPlan,
  energyBalance,
  isInPhaseWithGoal,
  remainingNutrients,
  suggestDishFromStock,
  basalMetabolicRate,
  computeDayPlan,
  dailyExpenditure,
  estimateWorkoutKcal,
  kcalFromMacros,
  nutrientsForGrams,
  recipeNutrition,
  stockCoverageDays,
  macroTargets,
  type BodyProfile,
} from "./calculations.ts";

const close = (actual: number, expected: number, tolerance = 0.01) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);

const JULES: BodyProfile = {
  sex: "male",
  birthYear: 1996,
  heightCm: 180,
  weightKg: 80,
  activityLevel: "moderate",
  goal: "bulk",
};

describe("métabolisme de base (Mifflin-St Jeor)", () => {
  it("calcule pour un homme", () => {
    // 10×80 + 6,25×180 − 5×30 + 5 = 1780
    assert.equal(basalMetabolicRate({ sex: "male", weightKg: 80, heightCm: 180, ageYears: 30 }), 1780);
  });

  it("calcule pour une femme", () => {
    // 10×60 + 6,25×165 − 5×28 − 161 = 1330,25
    close(basalMetabolicRate({ sex: "female", weightKg: 60, heightCm: 165, ageYears: 28 }), 1330.25);
  });

  it("déduit l'âge de l'année de naissance", () => {
    assert.equal(ageFromBirthYear(1996, 2026), 30);
    assert.equal(ageFromBirthYear(2030, 2026), 0);
  });
});

describe("dépense du jour", () => {
  it("estime avec le niveau d'activité quand rien n'est saisi", () => {
    const result = dailyExpenditure({ bmrKcal: 1780, weightKg: 80, activityLevel: "moderate" });
    assert.equal(result.method, "estimated");
    close(result.totalKcal, 1780 * 1.55);
  });

  it("considère « rien de saisi » sans pas ni séance", () => {
    const result = dailyExpenditure({
      bmrKcal: 1780,
      weightKg: 80,
      activityLevel: "active",
      activity: { steps: null, workouts: [] },
    });
    assert.equal(result.method, "estimated");
    close(result.totalKcal, 1780 * 1.725);
  });

  it("calcule base × 1,2 + pas × 0,0005 × poids + séances quand l'activité est saisie", () => {
    const result = dailyExpenditure({
      bmrKcal: 1780,
      weightKg: 80,
      activityLevel: "moderate",
      activity: { steps: 10000, workouts: [{ kcal: 350 }, { kcal: 150 }] },
    });
    assert.equal(result.method, "logged");
    close(result.stepsKcal, 400);
    assert.equal(result.workoutsKcal, 500);
    close(result.totalKcal, 1780 * 1.2 + 400 + 500);
  });

  it("compte des séances sans pas saisis", () => {
    const result = dailyExpenditure({
      bmrKcal: 1500,
      weightKg: 70,
      activityLevel: "light",
      activity: { steps: null, workouts: [{ kcal: 300 }] },
    });
    assert.equal(result.method, "logged");
    close(result.totalKcal, 1500 * 1.2 + 300);
  });
});

describe("séances", () => {
  it("estime les kcal d'une séance avec les MET (MET × poids × heures)", () => {
    assert.equal(estimateWorkoutKcal({ kind: "running", durationMin: 60, weightKg: 80 }), 784);
    assert.equal(estimateWorkoutKcal({ kind: "strength", durationMin: 90, weightKg: 80 }), 600);
    assert.equal(estimateWorkoutKcal({ kind: "crossfit", durationMin: 45, weightKg: 70 }), 420);
  });
});

describe("cibles macros", () => {
  it("prise de masse : +300 kcal, 2 g/kg de protéines, 1 g/kg de lipides, glucides = reste", () => {
    const targets = macroTargets({ goal: "bulk", weightKg: 80, expenditureKcal: 2759 });
    assert.equal(targets.kcal, 3059);
    assert.equal(targets.proteinG, 160);
    assert.equal(targets.fatG, 80);
    // (3059 − 160×4 − 80×9) / 4 = 424,75
    assert.equal(targets.carbsG, 425);
  });

  it("maintien : pas d'ajustement", () => {
    assert.equal(macroTargets({ goal: "maintain", weightKg: 70, expenditureKcal: 2500 }).kcal, 2500);
  });

  it("perte de gras : −400 kcal et 2,2 g/kg de protéines", () => {
    const targets = macroTargets({ goal: "cut", weightKg: 80, expenditureKcal: 2500 });
    assert.equal(targets.kcal, 2100);
    assert.equal(targets.proteinG, 176);
  });

  it("ne descend jamais sous 0 g de glucides", () => {
    assert.equal(macroTargets({ goal: "cut", weightKg: 120, expenditureKcal: 1500 }).carbsG, 0);
  });

  it("enchaîne profil → dépense → cible", () => {
    const plan = computeDayPlan(JULES, 2026);
    assert.equal(plan.bmrKcal, 1780);
    assert.equal(plan.expenditure.method, "estimated");
    assert.equal(plan.targets.kcal, Math.round(1780 * 1.55 + 300));
  });
});

describe("aliments", () => {
  it("déduit les kcal des macros (4 / 4 / 9)", () => {
    assert.equal(kcalFromMacros({ proteinG: 20, carbsG: 50, fatG: 10 }), 20 * 4 + 50 * 4 + 10 * 9);
  });
});

describe("recettes", () => {
  const chicken = { kcal: 112, proteinG: 24, carbsG: 0, fatG: 1.5 };
  const rice = { kcal: 352, proteinG: 8, carbsG: 77, fatG: 0.8 };
  const oil = { kcal: 900, proteinG: 0, carbsG: 0, fatG: 100 };

  it("calcule les apports d'une quantité d'aliment", () => {
    const result = nutrientsForGrams(chicken, 250);
    close(result.kcal, 280);
    close(result.proteinG, 60);
    close(result.fatG, 3.75);
  });

  it("calcule les macros totales et par portion", () => {
    const { total, perServing } = recipeNutrition(
      [
        { grams: 800, per100g: chicken },
        { grams: 400, per100g: rice },
        { grams: 20, per100g: oil },
      ],
      4,
    );
    // 896 + 1408 + 180 = 2484 kcal ; protéines 192 + 32 = 224 g
    close(total.kcal, 2484);
    close(total.proteinG, 224);
    close(total.carbsG, 308);
    close(total.fatG, 12 + 3.2 + 20);
    close(perServing.kcal, 621);
    close(perServing.proteinG, 56);
  });

  it("renvoie zéro pour une recette vide et protège contre 0 portion", () => {
    const { total, perServing } = recipeNutrition([], 0);
    assert.equal(total.kcal, 0);
    assert.equal(perServing.kcal, 0);
  });
});

describe("stock", () => {
  it("calcule le nombre de jours couverts par le stock", () => {
    assert.equal(stockCoverageDays(6, 2), 3);
    assert.equal(stockCoverageDays(0, 2), 0);
    assert.equal(stockCoverageDays(-1, 2), 0);
  });
});

describe("liste de courses", () => {
  const curry = {
    servings: 4,
    ingredients: [
      { foodId: "poulet", grams: 600 },
      { foodId: "riz", grams: 300 },
      { foodId: "lait-coco", grams: 200 },
    ],
  };
  const bowl = {
    servings: 2,
    ingredients: [
      { foodId: "riz", grams: 150 },
      { foodId: "thon", grams: 140 },
    ],
  };

  it("met les quantités à l'échelle des portions à préparer", () => {
    const list = aggregateShoppingList([{ ...curry, portionsToPrepare: 6 }]);
    assert.equal(list.get("poulet"), 900);
    assert.equal(list.get("riz"), 450);
    assert.equal(list.get("lait-coco"), 300);
  });

  it("additionne un même aliment présent dans plusieurs recettes", () => {
    const list = aggregateShoppingList([
      { ...curry, portionsToPrepare: 4 },
      { ...bowl, portionsToPrepare: 3 },
    ]);
    // riz : 300 + 150 × 1,5 = 525
    assert.equal(list.get("riz"), 525);
    assert.equal(list.get("thon"), 210);
  });

  it("arrondit au gramme supérieur et ignore les recettes à 0 portion", () => {
    const list = aggregateShoppingList([
      { servings: 3, portionsToPrepare: 1, ingredients: [{ foodId: "huile", grams: 10 }] },
      { ...bowl, portionsToPrepare: 0 },
    ]);
    assert.equal(list.get("huile"), 4);
    assert.equal(list.has("thon"), false);
  });
});

describe("bilan et objectif", () => {
  it("classe le bilan en surplus, équilibre ou déficit (tolérance 150 kcal)", () => {
    assert.deepEqual(energyBalance(3000, 2700), { kcal: 300, status: "surplus" });
    assert.deepEqual(energyBalance(2600, 2700), { kcal: -100, status: "balanced" });
    assert.deepEqual(energyBalance(2200, 2700), { kcal: -500, status: "deficit" });
  });

  it("vérifie que la journée va dans le sens de l'objectif", () => {
    assert.equal(isInPhaseWithGoal("bulk", "surplus"), true);
    assert.equal(isInPhaseWithGoal("cut", "surplus"), false);
    assert.equal(isInPhaseWithGoal("maintain", "balanced"), true);
  });

  it("calcule ce qu'il reste à manger", () => {
    const remaining = remainingNutrients(
      { kcal: 2800, proteinG: 160, carbsG: 330, fatG: 80 },
      { kcal: 1300, proteinG: 120, carbsG: 150, fatG: 40 },
    );
    assert.deepEqual(remaining, { kcal: 1500, proteinG: 40, carbsG: 180, fatG: 40 });
  });
});

describe("recommandation : plat du stock", () => {
  const dish = (id: string, kcal: number, proteinG: number, portionsLeft = 2) => ({
    id,
    name: id,
    portionsLeft,
    perServing: { kcal, proteinG, carbsG: 50, fatG: 10 },
  });

  it("choisit le plat qui comble le mieux protéines et kcal sans dépasser", () => {
    const remaining = { kcal: 700, proteinG: 45, carbsG: 80, fatG: 20 };
    const best = suggestDishFromStock(remaining, [
      dish("pates-bolo", 680, 30),
      dish("poulet-riz", 620, 50),
      dish("chili", 750, 48),
    ]);
    assert.equal(best?.id, "poulet-riz");
  });

  it("ignore les plats sans portion ou trop caloriques", () => {
    const remaining = { kcal: 400, proteinG: 30, carbsG: 40, fatG: 10 };
    assert.equal(
      suggestDishFromStock(remaining, [dish("vide", 350, 30, 0), dish("lourd", 650, 40)]),
      null,
    );
  });

  it("ne suggère rien quand la cible kcal est atteinte", () => {
    const remaining = { kcal: -50, proteinG: 20, carbsG: 0, fatG: 0 };
    assert.equal(suggestDishFromStock(remaining, [dish("poulet", 300, 40)]), null);
  });
});

describe("recommandation : portions à préparer", () => {
  it("ne demande rien si le stock tient jusqu'au prochain batch", () => {
    const plan = batchPlan({ stockPortions: 8, portionsPerDay: 2, batchesPerWeek: 2, daysSinceLastBatch: 0 });
    assert.equal(plan.missingNow, 0);
    assert.equal(plan.intervalDays, 3.5);
  });

  it("calcule les portions manquantes avant le prochain batch", () => {
    // Batch il y a 1 jour : 2,5 jours à couvrir × 2 portions = 5 ; stock 3 → il en manque 2.
    const plan = batchPlan({ stockPortions: 3, portionsPerDay: 2, batchesPerWeek: 2, daysSinceLastBatch: 1 });
    assert.equal(plan.missingNow, 2);
    assert.equal(plan.coveredDays, 1.5);
    // Au prochain batch : 7 portions pour 3,5 jours, rien ne restera.
    assert.equal(plan.nextBatchPortions, 7);
  });

  it("le jour du batch, propose de couvrir tout l'intervalle suivant", () => {
    const plan = batchPlan({ stockPortions: 1, portionsPerDay: 2, batchesPerWeek: 2, daysSinceLastBatch: 4 });
    assert.equal(plan.batchDue, true);
    assert.equal(plan.missingNow, 6);
    assert.equal(plan.nextBatchPortions, 7);
  });

  it("déduit du prochain batch ce qui restera en stock", () => {
    const plan = batchPlan({ stockPortions: 9, portionsPerDay: 2, batchesPerWeek: 2, daysSinceLastBatch: 1 });
    assert.equal(plan.missingNow, 0);
    assert.equal(plan.nextBatchPortions, 3);
  });

  it("sans aucune préparation, propose un premier batch complet", () => {
    const plan = batchPlan({ stockPortions: 0, portionsPerDay: 2, batchesPerWeek: 2, daysSinceLastBatch: null });
    assert.equal(plan.missingNow, 7);
  });
});
