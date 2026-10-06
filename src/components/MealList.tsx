"use client";

import { MacroLine } from "@/components/MacroLine";
import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { ConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { deleteMealEntry } from "@/app/(app)/ajouter/actions";
import type { MealEntry } from "@/lib/data/journal";
import { formatInteger } from "@/lib/format";

/** Repas d'une journée, supprimables (la portion revient en stock si elle en venait). */
export function MealList({ meals }: { meals: MealEntry[] }) {
  const toast = useToast();

  async function remove(meal: MealEntry) {
    const result = await deleteMealEntry(meal.id);
    if (result.ok) toast.success(result.message ?? "Repas retiré.");
    else toast.error(result.error);
  }

  return (
    <List>
      {meals.map((meal) => (
        <ListItem
          key={meal.id}
          leading={
            <span
              className={`flex size-9 items-center justify-center rounded-full ${
                meal.source === "stock" ? "bg-primary-soft text-primary" : "bg-energy-soft text-energy"
              }`}
            >
              <Icon name={meal.source === "stock" ? "kitchen" : "meal"} size={18} />
            </span>
          }
          title={meal.name}
          subtitle={
            meal.proteinG !== null || meal.carbsG !== null || meal.fatG !== null ? (
              <MacroLine
                proteinG={meal.proteinG ?? 0}
                carbsG={meal.carbsG ?? 0}
                fatG={meal.fatG ?? 0}
              />
            ) : (
              "Macros non renseignées"
            )
          }
          trailing={
            <span className="flex items-center gap-1">
              {formatInteger(meal.kcal)} kcal
              <ConfirmButton
                title={`Retirer « ${meal.name} » ?`}
                description={
                  meal.source === "stock"
                    ? "La portion reviendra dans ton stock."
                    : "Il sera retiré de ton journal."
                }
                confirmLabel="Retirer"
                ariaLabel={`Retirer ${meal.name}`}
                onConfirm={() => remove(meal)}
              >
                <Icon name="trash" size={18} />
              </ConfirmButton>
            </span>
          }
        />
      ))}
    </List>
  );
}
