import {
  computeDayPlan,
  energyBalance,
  isInPhaseWithGoal,
  remainingNutrients,
  sumNutrients,
  type BalanceStatus,
  type DayPlan,
  type Nutrients,
} from "@/lib/calculations";
import { coachTips, type CoachTip } from "@/lib/coach";
import { dayActivity, getActivity } from "@/lib/data/activity";
import { getMealEntries, mealNutrients, type MealEntry } from "@/lib/data/journal";
import type { Profile } from "@/lib/data/profile";
import { getLastPreparationDate, getStock } from "@/lib/data/stock";
import { getWeighIns } from "@/lib/data/weights";
import { addDays, currentYear, daysBetween, lastDays, todayIso } from "@/lib/dates";

export type DaySummary = {
  day: string;
  plan: DayPlan;
  intake: Nutrients;
  mealsCount: number;
  balance: { kcal: number; status: BalanceStatus };
  inPhase: boolean;
};

function summarizeDay(
  profile: Profile,
  year: number,
  day: string,
  meals: MealEntry[],
  activity: Awaited<ReturnType<typeof getActivity>>,
): DaySummary {
  const dayMeals = meals.filter((meal) => meal.eatenOn === day);
  const plan = computeDayPlan(profile, year, dayActivity(activity, day));
  const intake = sumNutrients(dayMeals.map(mealNutrients));
  const balance = energyBalance(intake.kcal, plan.expenditure.totalKcal);
  return {
    day,
    plan,
    intake,
    mealsCount: dayMeals.length,
    balance,
    inPhase: isInPhaseWithGoal(profile.goal, balance.status),
  };
}

/** Tout ce qu'il faut pour l'écran « Aujourd'hui » : jour, coach et semaine glissante. */
export async function getDashboard(profile: Profile) {
  const today = todayIso();
  const weekStart = addDays(today, -6);
  const year = currentYear();

  const [meals, activity, stock, lastPreparation, weighIns] = await Promise.all([
    getMealEntries(weekStart, today),
    getActivity(weekStart, today),
    getStock(),
    getLastPreparationDate(),
    getWeighIns(1),
  ]);

  const week = lastDays(today, 7).map((day) => summarizeDay(profile, year, day, meals, activity));
  const todaySummary = week[week.length - 1];
  const remaining = remainingNutrients(todaySummary.plan.targets, todaySummary.intake);

  const stockDishes = stock
    .filter((item) => item.portionsLeft >= 1)
    .map((item) => ({
      id: item.recipeId,
      name: item.name,
      perServing: item.perServing,
      portionsLeft: item.portionsLeft,
    }));

  const coach = coachTips({
    remaining,
    stock: stockDishes,
    portionsPerDay: profile.stockPortionsPerDay,
    batchesPerWeek: profile.batchesPerWeek,
    daysSinceLastBatch: lastPreparation ? daysBetween(lastPreparation, today) : null,
    daysSinceLastWeighIn: weighIns[0] ? daysBetween(weighIns[0].day, today) : null,
  });

  return {
    today,
    todaySummary,
    remaining,
    meals: meals.filter((meal) => meal.eatenOn === today),
    tips: coach.tips as CoachTip[],
    week,
  };
}
