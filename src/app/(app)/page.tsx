import { PageHeader } from "@/components/layout/PageHeader";
import { MealList } from "@/components/MealList";
import { TargetSummary } from "@/components/TargetSummary";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { computeDayPlan, sumNutrients } from "@/lib/calculations";
import { getMealEntries, mealNutrients } from "@/lib/data/journal";
import { getProfile } from "@/lib/data/profile";
import { currentYear, todayIso } from "@/lib/dates";
import { formatInteger } from "@/lib/format";

export default async function TodayPage() {
  const today = todayIso();
  const [profile, meals] = await Promise.all([getProfile(), getMealEntries(today, today)]);
  if (!profile) return null;
  const plan = computeDayPlan(profile, currentYear());
  const intake = sumNutrients(meals.map(mealNutrients));

  return (
    <>
      <PageHeader title="Aujourd'hui" />
      <div className="flex flex-col gap-section">
        <Card>
          <CardHeader
            title="Ta cible du jour"
            subtitle={`${formatInteger(intake.kcal)} kcal mangées sur ${formatInteger(plan.targets.kcal)} estimées`}
          />
          <TargetSummary targets={plan.targets} />
        </Card>

        <section>
          <SectionTitle>Repas du jour</SectionTitle>
          {meals.length === 0 ? (
            <EmptyState
              icon="meal"
              title="Aucun repas noté"
              description="Un repas s'ajoute en deux gestes depuis le bouton +."
              action={<ButtonLink href="/ajouter">Ajouter un repas</ButtonLink>}
            />
          ) : (
            <MealList meals={meals} />
          )}
        </section>
      </div>
    </>
  );
}
