import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StepsForm } from "@/components/StepsForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";
import { RULES, computeDayPlan } from "@/lib/calculations";
import { dayActivity, getActivity } from "@/lib/data/activity";
import { getProfile } from "@/lib/data/profile";
import { addDays, currentYear, todayIso } from "@/lib/dates";
import { formatInteger, formatKcal } from "@/lib/format";
import { ACTIVITY_LEVELS, labelOf } from "@/lib/labels";
import { WorkoutList } from "./WorkoutList";

export const metadata: Metadata = { title: "Activité" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-callout text-ink-muted">{label}</span>
      <span className="whitespace-nowrap text-callout font-semibold text-ink">{value}</span>
    </div>
  );
}

export default async function ActivityPage() {
  const today = todayIso();
  const [profile, activity] = await Promise.all([
    getProfile(),
    getActivity(addDays(today, -6), today),
  ]);
  if (!profile) redirect("/onboarding");

  const todayActivity = dayActivity(activity, today);
  const { expenditure } = computeDayPlan(profile, currentYear(), todayActivity);

  return (
    <>
      <PageHeader title="Activité" />
      <div className="flex flex-col gap-section">
        <Card>
          <CardHeader
            title="Dépense du jour"
            subtitle={
              expenditure.method === "logged"
                ? "Calculée avec tes pas et tes séances."
                : `Estimée avec ton activité habituelle (${labelOf(ACTIVITY_LEVELS, profile.activityLevel).toLowerCase()}). Saisis tes pas ou une séance pour l'affiner.`
            }
          />
          <p className="text-display text-energy">{formatInteger(expenditure.totalKcal)}</p>
          <p className="mb-3 text-callout text-ink-muted">kcal estimées</p>
          {expenditure.method === "logged" ? (
            <div className="divide-y divide-line border-t border-line">
              <Row
                label="Vie quotidienne (métabolisme × 1,2)"
                value={formatKcal(expenditure.bmrKcal * RULES.dailyLifeFactor)}
              />
              <Row label="Pas" value={formatKcal(expenditure.stepsKcal)} />
              <Row label="Séances" value={formatKcal(expenditure.workoutsKcal)} />
            </div>
          ) : null}
        </Card>

        <section>
          <SectionTitle>Pas aujourd&apos;hui</SectionTitle>
          <Card>
            <StepsForm day="today" currentSteps={todayActivity.steps} />
          </Card>
        </section>

        <section>
          <SectionTitle
            action={
              <ButtonLink href="/ajouter?onglet=seance" variant="ghost" size="sm">
                <Icon name="plus" size={16} />
                Séance
              </ButtonLink>
            }
          >
            Séances des 7 derniers jours
          </SectionTitle>
          {activity.workouts.length === 0 ? (
            <EmptyState
              icon="workout"
              title="Aucune séance cette semaine"
              description="Muscu, course, CrossFit : chaque séance ajuste ta cible du jour."
              action={<ButtonLink href="/ajouter?onglet=seance">Ajouter une séance</ButtonLink>}
            />
          ) : (
            <WorkoutList workouts={activity.workouts} today={today} />
          )}
        </section>
      </div>
    </>
  );
}
