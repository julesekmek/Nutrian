"use client";

import { useMemo, useState } from "react";
import { MacroLine } from "@/components/MacroLine";
import { SearchInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { formatInteger } from "@/lib/format";
import { matchesSearch, type Food } from "@/lib/foods";

const MAX_RESULTS = 40;

/** Modale de choix d'un aliment, avec recherche instantanée. */
export function FoodPicker({
  open,
  onClose,
  foods,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  foods: Food[];
  onPick: (food: Food) => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => foods.filter((food) => matchesSearch(food.name, query)).slice(0, MAX_RESULTS),
    [foods, query],
  );

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un ingrédient">
      <div className="flex flex-col gap-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Poulet, riz, brocoli…" />
        {results.length === 0 ? (
          <p className="py-6 text-center text-callout text-ink-muted">
            Aucun aliment trouvé. Ajoute-le dans Cuisine › Aliments.
          </p>
        ) : (
          <ul className="flex max-h-[55dvh] flex-col divide-y divide-line overflow-y-auto">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(food);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 py-2.5 text-left active:bg-surface-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body text-ink">{food.name}</span>
                    <span className="block text-footnote text-ink-muted">
                      <MacroLine proteinG={food.proteinG} carbsG={food.carbsG} fatG={food.fatG} /> · pour
                      100 g
                    </span>
                  </span>
                  <span className="shrink-0 text-callout text-ink-muted">
                    {formatInteger(food.kcal)} kcal
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
