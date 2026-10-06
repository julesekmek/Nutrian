"use client";

import { useRouter } from "next/navigation";
import { saveSteps } from "@/app/(app)/ajouter/actions";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";

/** Saisie (ou correction) du nombre de pas d'une journée. */
export function StepsForm({
  day,
  currentSteps,
  redirectTo,
}: {
  day: "today" | "yesterday";
  currentSteps: number | null;
  redirectTo?: string;
}) {
  const router = useRouter();
  return (
    <ActionForm
      action={saveSteps}
      resetOnSuccess={false}
      onSuccess={() => (redirectTo ? router.push(redirectTo) : undefined)}
    >
      {({ fieldErrors, pending }) => (
        <div className="flex items-end gap-3">
          <input type="hidden" name="day" value={day} />
          <div className="flex-1">
            <NumberField
              label="Nombre de pas"
              name="steps"
              inputMode="numeric"
              suffix="pas"
              placeholder="8 500"
              defaultValue={currentSteps === null ? "" : String(currentSteps)}
              error={fieldErrors.steps}
            />
          </div>
          <Button type="submit" size="md" pending={pending} className="mb-px">
            {currentSteps === null ? "Ajouter" : "Mettre à jour"}
          </Button>
        </div>
      )}
    </ActionForm>
  );
}
