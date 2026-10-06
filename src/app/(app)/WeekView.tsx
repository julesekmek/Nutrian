import { Card, SectionTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/Gauge";
import type { BalanceStatus, Goal } from "@/lib/calculations";
import type { DaySummary } from "@/lib/data/dashboard";
import { formatWeekday } from "@/lib/dates";
import { formatInteger, formatSigned } from "@/lib/format";

const STATUS_LABELS: Record<BalanceStatus, string> = {
  surplus: "surplus",
  balanced: "équilibre",
  deficit: "déficit",
};

const GOAL_EXPECTATION: Record<Goal, string> = {
  bulk: "un léger surplus",
  maintain: "l'équilibre",
  cut: "un déficit modéré",
};

export function WeekView({ week, goal, today }: { week: DaySummary[]; goal: Goal; today: string }) {
  const logged = week.filter((day) => day.mealsCount > 0);
  const completedLogged = logged.filter((day) => day.day !== today);
  const inPhase = completedLogged.filter((day) => day.inPhase).length;
  const averageBalance =
    completedLogged.length > 0
      ? completedLogged.reduce((sum, day) => sum + day.balance.kcal, 0) / completedLogged.length
      : null;

  return (
    <div className="flex flex-col gap-section">
      <Card>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-title text-ink">{logged.length}/7</p>
            <p className="text-caption text-ink-muted">jours saisis</p>
          </div>
          <div>
            <p className="text-title text-ink">
              {completedLogged.length > 0 ? `${inPhase}/${completedLogged.length}` : "–"}
            </p>
            <p className="text-caption text-ink-muted">jours en phase</p>
          </div>
          <div>
            <p className="text-title text-ink">
              {averageBalance === null ? "–" : formatSigned(averageBalance)}
            </p>
            <p className="text-caption text-ink-muted">kcal/jour en moyenne</p>
          </div>
        </div>
        <p className="mt-3 text-center text-footnote text-ink-muted">
          Pour ton objectif, on vise {GOAL_EXPECTATION[goal]} chaque jour.
        </p>
      </Card>

      <section>
        <SectionTitle>Jour par jour</SectionTitle>
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
          {[...week].reverse().map((day) => {
            const isToday = day.day === today;
            return (
              <li key={day.day} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-headline capitalize text-ink">
                    {isToday ? "Aujourd'hui" : formatWeekday(day.day)}
                    <span className="ml-1.5 text-footnote font-normal normal-case text-ink-muted">
                      {day.day.slice(8, 10)}/{day.day.slice(5, 7)}
                    </span>
                  </span>
                  {day.mealsCount === 0 ? (
                    <span className="text-footnote text-ink-subtle">Pas de saisie</span>
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-footnote font-semibold ${
                        isToday
                          ? "bg-surface-muted text-ink-muted"
                          : day.inPhase
                            ? "bg-success-soft text-success"
                            : "bg-surface-muted text-ink"
                      }`}
                    >
                      {formatSigned(day.balance.kcal)} kcal · {isToday ? "en cours" : STATUS_LABELS[day.balance.status]}
                    </span>
                  )}
                </div>
                {day.mealsCount > 0 ? (
                  <>
                    <ProgressBar
                      value={day.intake.kcal}
                      max={day.plan.targets.kcal}
                      tone="energy"
                      label={`Apports du ${day.day}`}
                    />
                    <p className="text-caption text-ink-muted">
                      {formatInteger(day.intake.kcal)} / {formatInteger(day.plan.targets.kcal)} kcal ·{" "}
                      {formatInteger(day.intake.proteinG)} / {formatInteger(day.plan.targets.proteinG)} g de
                      protéines · dépense {formatInteger(day.plan.expenditure.totalKcal)} kcal
                    </p>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
      <p className="px-1 text-center text-caption text-ink-subtle">
        Bilan = apports − dépense estimée. Un écart est juste une information : ajuste le lendemain.
      </p>
    </div>
  );
}
