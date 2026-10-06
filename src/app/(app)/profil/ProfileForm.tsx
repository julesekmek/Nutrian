"use client";

import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, NumberField, SelectField } from "@/components/ui/Field";
import type { Profile } from "@/lib/data/profile";
import { ACTIVITY_LEVELS, GOALS, SEXES } from "@/lib/labels";
import { updateProfile } from "../../onboarding/actions";

export function ProfileForm({ profile, age }: { profile: Profile; age: number }) {
  return (
    <ActionForm action={updateProfile} resetOnSuccess={false}>
      {({ fieldErrors, pending }) => (
        <>
          <ChoiceGroup
            label="Objectif"
            name="goal"
            options={GOALS.map(({ value, label }) => ({ value, label }))}
            defaultValue={profile.goal}
            error={fieldErrors.goal}
          />
          <ChoiceGroup
            label="Sexe"
            name="sex"
            options={SEXES}
            defaultValue={profile.sex}
            error={fieldErrors.sex}
          />
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Âge"
              name="age"
              suffix="ans"
              inputMode="numeric"
              defaultValue={String(age)}
              error={fieldErrors.age}
            />
            <NumberField
              label="Taille"
              name="heightCm"
              suffix="cm"
              inputMode="numeric"
              defaultValue={String(profile.heightCm)}
              error={fieldErrors.heightCm}
            />
            <NumberField
              label="Poids"
              name="weightKg"
              suffix="kg"
              defaultValue={String(profile.weightKg).replace(".", ",")}
              error={fieldErrors.weightKg}
            />
          </div>
          <SelectField
            label="Activité habituelle"
            name="activityLevel"
            defaultValue={profile.activityLevel}
            options={ACTIVITY_LEVELS.map(({ value, label, description }) => ({
              value,
              label: `${label} (${description.replace(/\.$/, "").toLowerCase()})`,
            }))}
            error={fieldErrors.activityLevel}
          />
          <Button type="submit" size="lg" fullWidth pending={pending}>
            Enregistrer
          </Button>
        </>
      )}
    </ActionForm>
  );
}
