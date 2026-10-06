"use client";

import { useRouter } from "next/navigation";
import { saveWeighIn } from "@/app/(app)/ajouter/actions";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";

/** Saisie d'une pesée ; la plus récente devient le poids de référence des cibles. */
export function WeighInForm({
  day,
  lastWeightKg,
  redirectTo,
}: {
  day: "today" | "yesterday";
  lastWeightKg: number | null;
  redirectTo?: string;
}) {
  const router = useRouter();
  return (
    <ActionForm action={saveWeighIn} onSuccess={() => (redirectTo ? router.push(redirectTo) : undefined)}>
      {({ fieldErrors, pending }) => (
        <div className="flex items-end gap-3">
          <input type="hidden" name="day" value={day} />
          <div className="flex-1">
            <NumberField
              label="Poids"
              name="weightKg"
              suffix="kg"
              placeholder={lastWeightKg ? String(lastWeightKg).replace(".", ",") : "75,0"}
              error={fieldErrors.weightKg}
            />
          </div>
          <Button type="submit" pending={pending} className="mb-px">
            Enregistrer
          </Button>
        </div>
      )}
    </ActionForm>
  );
}
