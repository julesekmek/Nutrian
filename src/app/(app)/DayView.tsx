import { MealList } from "@/components/MealList";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, SectionTitle } from "@/components/ui/Card";
import { MacroGauge, Ring } from "@/components/ui/Gauge";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";
import type { Nutrients } from "@/lib/calculations";
import type { CoachTip } from "@/lib/coach";
import type { DaySummary } from "@/lib/data/dashboard";
import type { MealEntry } from "@/lib/data/journal";
import { formatInteger, formatSigned } from "@/lib/format";

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <div>
        <p className="text-callout text-ink">{label}</p>
        {hint ? <p className="text-caption text-ink-muted">{hint}</p> : null}
      </div>
      <p className="whitespace-nowrap text-headline text-ink">{value}</p>
    </div>
  );
}

export function DayView({
  summary,
  remaining,
  tips,
  meals,
}: {
  summary: DaySummary;
  remaining: Nutrients;
  tips: CoachTip[];
  meals: MealEntry[];
}) {
  const { plan, intake, balance } = summary;
  const targets = plan.targets;

  return (
    <div className="flex flex-col gap-section">
      <Card>
        <div className="flex flex-col items-center gap-5">
          <Ring
            value={intake.kcal}
            max={targets.kcal}
            tone="energy"
            label={`${formatInteger(intake.kcal)} kcal sur ${formatInteger(targets.kcal)}`}
          >
            <span className="text-display text-ink">{formatInteger(intake.kcal)}</span>
            <span className="text-footnote text-ink-muted">/ {formatInteger(targets.kcal)} kcal</span>
          </Ring>
          <p className="text-callout text-ink-muted">
            {remaining.kcal > 0 ? (
              <>
                Il reste <span className="font-semibold text-ink">{formatInteger(remaining.kcal)} kcal</span>{" "}
                pour ta cible estimée
              </>
            ) : (
              <span className="font-semibold text-success">Cible du jour atteinte, bien joué</span>
            )}
          </p>
          <div className="grid w-full gap-4">
            <MacroGauge label="Protéines" value={intake.proteinG} target={targets.proteinG} tone="protein" />
            <MacroGauge label="Glucides" value={intake.carbsG} target={targets.carbsG} tone="carbs" />
            <MacroGauge label="Lipides" value={intake.fatG} target={targets.fatG} tone="fat" />
          </div>
        </div>
      </Card>

      <section>
        <SectionTitle>Le coach</SectionTitle>
        <div className="flex flex-col gap-2">
          {tips.map((tip) => (
            <Card key={tip.id} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Icon name="sparkle" size={18} />
              </span>
              <div className="flex-1">
                <p className="text-callout text-ink">{tip.text}</p>
                {tip.action ? (
                  <ButtonLink href={tip.action.href} variant="ghost" size="sm" className="-ml-3 mt-1">
                    {tip.action.label}
                  </ButtonLink>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader
          title="Dépense et bilan"
          subtitle={
            plan.expenditure.method === "logged"
              ? "Dépense calculée avec tes pas et tes séances."
              : "Dépense estimée avec ton activité habituelle."
          }
        />
        <div className="divide-y divide-line">
          <Row label="Dépense du jour" value={`${formatInteger(plan.expenditure.totalKcal)} kcal`} />
          <Row label="Apports" value={`${formatInteger(intake.kcal)} kcal`} />
          <Row
            label="Bilan en cours"
            hint="Apports − dépense, il évolue au fil des repas."
            value={`${formatSigned(balance.kcal)} kcal`}
          />
        </div>
        <ButtonLink href="/activite" variant="ghost" size="sm" className="-ml-3 mt-1">
          Détail de l&apos;activité
        </ButtonLink>
      </Card>

      <section>
        <SectionTitle>Repas du jour</SectionTitle>
        {meals.length === 0 ? (
          <EmptyState
            icon="meal"
            title="Aucun repas noté"
            description="Un plat de ton stock s'ajoute en deux gestes depuis le bouton +."
            action={<ButtonLink href="/ajouter">Ajouter un repas</ButtonLink>}
          />
        ) : (
          <MealList meals={meals} />
        )}
      </section>

      <p className="px-1 text-center text-caption text-ink-subtle">
        Cibles et dépenses sont des estimations, pas un avis médical.
      </p>
    </div>
  );
}
