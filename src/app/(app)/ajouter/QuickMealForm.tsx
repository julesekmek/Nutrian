"use client";

import { useRouter } from "next/navigation";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { NumberField, TextField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { deleteMealEntry, logQuickMeal } from "./actions";

/** Repas hors stock (restaurant, snack, fruit) : nom + kcal, macros facultatives. */
export function QuickMealForm({ day }: { day: "today" | "yesterday" }) {
  const router = useRouter();
  const toast = useToast();

  return (
    <ActionForm
      action={logQuickMeal}
      successToast={false}
      onSuccess={(result) => {
        const entryId = result.data?.entryId;
        toast.success(
          result.message ?? "C'est noté.",
          entryId
            ? {
                label: "Annuler",
                onClick: async () => {
                  const undo = await deleteMealEntry(entryId);
                  if (undo.ok) toast.info("Repas retiré.");
                  else toast.error(undo.error);
                },
              }
            : undefined,
        );
        router.push("/");
      }}
    >
      {({ fieldErrors, pending }) => (
        <>
          <input type="hidden" name="day" value={day} />
          <div className="grid grid-cols-[1fr_7.5rem] gap-3">
            <TextField
              label="Quoi ?"
              name="name"
              placeholder="Restaurant, banane…"
              autoComplete="off"
              error={fieldErrors.name}
            />
            <NumberField label="Énergie" name="kcal" suffix="kcal" error={fieldErrors.kcal} />
          </div>
          <details className="group">
            <summary className="cursor-pointer list-none px-1 text-callout font-semibold text-primary">
              <span className="group-open:hidden">+ Ajouter les macros (facultatif)</span>
              <span className="hidden group-open:inline">Macros (facultatif)</span>
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <NumberField label="Protéines" name="proteinG" suffix="g" error={fieldErrors.proteinG} />
              <NumberField label="Glucides" name="carbsG" suffix="g" error={fieldErrors.carbsG} />
              <NumberField label="Lipides" name="fatG" suffix="g" error={fieldErrors.fatG} />
            </div>
          </details>
          <Button type="submit" size="lg" fullWidth pending={pending}>
            Ajouter le repas
          </Button>
        </>
      )}
    </ActionForm>
  );
}
