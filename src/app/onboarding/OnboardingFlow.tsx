"use client";

import { useState, useTransition } from "react";
import { TargetSummary } from "@/components/TargetSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { InlineError } from "@/components/ui/States";
import {
  computeDayPlan,
  type ActivityLevel,
  type Goal,
  type Sex,
} from "@/lib/calculations";
import { formatKcal } from "@/lib/format";
import { ACTIVITY_LEVELS, GOALS, SEXES } from "@/lib/labels";
import { completeOnboarding } from "./actions";

type Answers = {
  goal?: Goal;
  sex?: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  activityLevel?: ActivityLevel;
};

const STEP_COUNT = 5;

function parseNumber(value: string): number {
  return Number(value.replace(",", ".").trim());
}

function inRange(value: string, min: number, max: number) {
  const number = parseNumber(value);
  return value.trim() !== "" && Number.isFinite(number) && number >= min && number <= max;
}

function OptionButton({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "w-full rounded-card border px-4 py-4 text-left transition-colors active:scale-[0.99]",
        selected ? "border-primary bg-primary-soft" : "border-line bg-surface",
      ].join(" ")}
    >
      <span className={`block text-headline ${selected ? "text-primary" : "text-ink"}`}>{title}</span>
      {description ? (
        <span className="mt-0.5 block text-callout text-ink-muted">{description}</span>
      ) : null}
    </button>
  );
}

export function OnboardingFlow({ currentYear }: { currentYear: number }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ age: "", heightCm: "", weightKg: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (patch: Partial<Answers>) => setAnswers((current) => ({ ...current, ...patch }));
  const next = () => setStep((current) => Math.min(current + 1, STEP_COUNT - 1));
  const back = () => setStep((current) => Math.max(current - 1, 0));

  const canContinue = [
    Boolean(answers.goal),
    Boolean(answers.sex) && inRange(answers.age, 14, 100),
    inRange(answers.heightCm, 100, 250) && inRange(answers.weightKg, 30, 300),
    Boolean(answers.activityLevel),
    true,
  ][step];

  const plan =
    answers.goal && answers.sex && answers.activityLevel && step === STEP_COUNT - 1
      ? computeDayPlan(
          {
            goal: answers.goal,
            sex: answers.sex,
            birthYear: currentYear - Math.round(parseNumber(answers.age)),
            heightCm: parseNumber(answers.heightCm),
            weightKg: parseNumber(answers.weightKg),
            activityLevel: answers.activityLevel,
          },
          currentYear,
        )
      : null;

  function submit() {
    const formData = new FormData();
    formData.set("goal", answers.goal ?? "");
    formData.set("sex", answers.sex ?? "");
    formData.set("age", answers.age);
    formData.set("heightCm", answers.heightCm);
    formData.set("weightKg", answers.weightKg);
    formData.set("activityLevel", answers.activityLevel ?? "");
    startTransition(async () => {
      const result = await completeOnboarding(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex items-center gap-3 pt-4 pb-6">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Étape précédente"
            className="flex size-9 items-center justify-center rounded-full bg-surface text-ink"
          >
            <Icon name="chevronLeft" size={20} />
          </button>
        ) : (
          <div className="size-9" />
        )}
        <div className="flex flex-1 gap-1.5" aria-label={`Étape ${step + 1} sur ${STEP_COUNT}`}>
          {Array.from({ length: STEP_COUNT }, (_, index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-surface-muted"}`}
            />
          ))}
        </div>
        <div className="size-9" />
      </div>

      <div className="flex flex-1 flex-col gap-5">
        {step === 0 ? (
          <>
            <div>
              <h1 className="text-title text-ink">Quel est ton objectif ?</h1>
              <p className="mt-1 text-callout text-ink-muted">
                On adapte ta cible quotidienne. Tu pourras en changer quand tu veux.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {GOALS.map((goal) => (
                <OptionButton
                  key={goal.value}
                  selected={answers.goal === goal.value}
                  title={goal.label}
                  description={goal.description}
                  onClick={() => {
                    update({ goal: goal.value });
                    next();
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <h1 className="text-title text-ink">Parle-moi de toi</h1>
              <p className="mt-1 text-callout text-ink-muted">
                Ça sert à estimer ton métabolisme de base.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SEXES.map((sex) => (
                <OptionButton
                  key={sex.value}
                  selected={answers.sex === sex.value}
                  title={sex.label}
                  onClick={() => update({ sex: sex.value })}
                />
              ))}
            </div>
            <NumberField
              label="Âge"
              name="age"
              suffix="ans"
              inputMode="numeric"
              value={answers.age}
              onChange={(event) => update({ age: event.target.value })}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <h1 className="text-title text-ink">Tes mensurations</h1>
              <p className="mt-1 text-callout text-ink-muted">
                Ton poids sera mis à jour à chaque pesée.
              </p>
            </div>
            <NumberField
              label="Taille"
              name="heightCm"
              suffix="cm"
              inputMode="numeric"
              value={answers.heightCm}
              onChange={(event) => update({ heightCm: event.target.value })}
            />
            <NumberField
              label="Poids"
              name="weightKg"
              suffix="kg"
              value={answers.weightKg}
              onChange={(event) => update({ weightKg: event.target.value })}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div>
              <h1 className="text-title text-ink">Ton activité habituelle</h1>
              <p className="mt-1 text-callout text-ink-muted">
                Utilisée les jours où tu ne saisis ni pas ni séance.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {ACTIVITY_LEVELS.map((level) => (
                <OptionButton
                  key={level.value}
                  selected={answers.activityLevel === level.value}
                  title={level.label}
                  description={level.description}
                  onClick={() => {
                    update({ activityLevel: level.value });
                    next();
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {step === 4 && plan ? (
          <>
            <div className="text-center">
              <p className="text-footnote font-semibold uppercase tracking-wide text-primary">
                C&apos;est prêt
              </p>
              <h1 className="mt-1 text-title text-ink">Ta cible quotidienne</h1>
            </div>
            <Card>
              <TargetSummary targets={plan.targets} />
            </Card>
            <p className="text-center text-footnote text-ink-muted">
              Estimation à partir de ton métabolisme de base ({formatKcal(plan.bmrKcal)}) et de
              ton activité. Elle s&apos;ajuste chaque jour avec tes pas, tes séances et tes pesées.
            </p>
            {error ? <InlineError>{error}</InlineError> : null}
          </>
        ) : null}
      </div>

      <div className="pb-safe sticky bottom-0 bg-canvas py-4">
        {step === STEP_COUNT - 1 ? (
          <Button size="lg" fullWidth onClick={submit} pending={pending}>
            C&apos;est parti
          </Button>
        ) : step === 1 || step === 2 ? (
          <Button size="lg" fullWidth onClick={next} disabled={!canContinue}>
            Continuer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
