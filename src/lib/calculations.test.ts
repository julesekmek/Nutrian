import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ageFromBirthYear,
  basalMetabolicRate,
  computeDayPlan,
  dailyExpenditure,
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
