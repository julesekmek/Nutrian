import {
  batchPlan,
  suggestDishFromStock,
  type Nutrients,
  type StockDish,
} from "@/lib/calculations";
import { formatDecimal, formatInteger } from "@/lib/format";

/**
 * Recommandations du coach : 1 à 2 messages concrets, ton encourageant, jamais culpabilisant.
 * Les règles chiffrées vivent dans calculations.ts ; ce module ne fait que les formuler.
 */
export type CoachTip = {
  id: string;
  text: string;
  action?: { href: string; label: string };
};

const PROTEIN_GAP_G = 15;
const KCAL_GAP = 200;
const WEIGH_IN_EVERY_DAYS = 7;

export function coachTips({
  remaining,
  stock,
  portionsPerDay,
  batchesPerWeek,
  daysSinceLastBatch,
  daysSinceLastWeighIn,
}: {
  remaining: Nutrients;
  stock: StockDish[];
  portionsPerDay: number;
  batchesPerWeek: number;
  daysSinceLastBatch: number | null;
  daysSinceLastWeighIn: number | null;
}): { tips: CoachTip[]; suggestedDishId: string | null } {
  const tips: CoachTip[] = [];
  const proteinGap = Math.round(remaining.proteinG);
  const kcalGap = Math.round(remaining.kcal);
  const dish = suggestDishFromStock(remaining, stock);

  // 1. Le repas qui comble le manque du jour.
  if (proteinGap >= PROTEIN_GAP_G || kcalGap >= KCAL_GAP) {
    if (dish) {
      tips.push({
        id: "dish",
        text: `Il te reste ${formatInteger(Math.max(0, proteinGap))} g de protéines et ${formatInteger(Math.max(0, kcalGap))} kcal : une portion de ${dish.name} (${formatInteger(dish.perServing.proteinG)} g de protéines, ${formatInteger(dish.perServing.kcal)} kcal) comble bien le manque.`,
        action: { href: `/ajouter?plat=${dish.id}`, label: "Ajouter ce plat" },
      });
    } else if (proteinGap >= PROTEIN_GAP_G) {
      tips.push({
        id: "protein",
        text: `Encore ${formatInteger(proteinGap)} g de protéines pour boucler ta journée : un skyr, des œufs ou un shaker de whey feront l'affaire.`,
        action: { href: "/ajouter", label: "Ajouter un repas" },
      });
    } else {
      tips.push({
        id: "kcal",
        text: `Il reste ${formatInteger(kcalGap)} kcal à placer aujourd'hui pour rester en phase avec ton objectif.`,
        action: { href: "/ajouter", label: "Ajouter un repas" },
      });
    }
  } else {
    tips.push({
      id: "done",
      text:
        kcalGap < -KCAL_GAP
          ? "Cible du jour atteinte, bien joué. Si la faim revient, mise sur les légumes et les protéines maigres."
          : "Bien joué, ta cible du jour est atteinte.",
    });
  }

  // 2. Le stock tiendra-t-il jusqu'au prochain batch ?
  const totalStock = stock.reduce((sum, item) => sum + item.portionsLeft, 0);
  const plan = batchPlan({
    stockPortions: totalStock,
    portionsPerDay,
    batchesPerWeek,
    daysSinceLastBatch,
  });
  if (plan.missingNow > 0) {
    tips.push({
      id: "batch",
      text:
        totalStock > 0
          ? `Ton stock couvre environ ${formatDecimal(Math.round(plan.coveredDays * 2) / 2)} jour${plan.coveredDays >= 2 ? "s" : ""} : prépare ${plan.missingNow} portion${plan.missingNow > 1 ? "s" : ""} de plus pour tenir jusqu'au prochain batch.`
          : `Ton stock est vide : prépare ${plan.missingNow} portion${plan.missingNow > 1 ? "s" : ""} pour tenir jusqu'au prochain batch.`,
      action: { href: "/cuisine/courses", label: "Préparer mes courses" },
    });
  } else if (daysSinceLastWeighIn === null || daysSinceLastWeighIn >= WEIGH_IN_EVERY_DAYS) {
    // 3. À défaut, un rappel de pesée hebdomadaire.
    tips.push({
      id: "weigh-in",
      text:
        daysSinceLastWeighIn === null
          ? "Pèse-toi une fois par semaine pour garder une cible juste."
          : `Dernière pesée il y a ${daysSinceLastWeighIn} jours : une pesée au réveil réajustera ta cible.`,
      action: { href: "/ajouter?onglet=pesee", label: "Me peser" },
    });
  }

  return { tips: tips.slice(0, 2), suggestedDishId: dish?.id ?? null };
}
