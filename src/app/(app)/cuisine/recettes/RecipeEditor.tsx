"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { FoodPicker } from "@/components/FoodPicker";
import { NutritionSummary } from "@/components/NutritionSummary";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Stepper, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "@/components/ui/Modal";
import { InlineError } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { nutrientsForGrams, recipeNutrition } from "@/lib/calculations";
import type { RecipeIngredient } from "@/lib/data/recipes";
import { formatInteger } from "@/lib/format";
import type { Food } from "@/lib/foods";
import { deleteRecipe, saveRecipe } from "../actions";

type Row = { key: number; food: Food; grams: string };

function parseGrams(value: string): number {
  return Number(value.replace(",", ".").trim());
}

function isValidGrams(value: string): boolean {
  const grams = parseGrams(value);
  return value.trim() !== "" && Number.isFinite(grams) && grams > 0 && grams <= 20000;
}

export function RecipeEditor({
  foods,
  recipe,
}: {
  foods: Food[];
  recipe?: { id: string; name: string; servings: number; ingredients: RecipeIngredient[] };
}) {
  const router = useRouter();
  const toast = useToast();
  const nextKey = useRef(recipe?.ingredients.length ?? 0);
  const [name, setName] = useState(recipe?.name ?? "");
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [rows, setRows] = useState<Row[]>(
    recipe?.ingredients.map((ingredient, index) => ({
      key: index,
      food: ingredient.food,
      grams: String(ingredient.grams).replace(".", ","),
    })) ?? [],
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [pending, startTransition] = useTransition();

  const nutrition = useMemo(
    () =>
      recipeNutrition(
        rows
          .filter((row) => isValidGrams(row.grams))
          .map((row) => ({ grams: parseGrams(row.grams), per100g: row.food })),
        servings,
      ),
    [rows, servings],
  );

  function addFood(food: Food) {
    setRows((current) => [...current, { key: nextKey.current++, food, grams: "100" }]);
    setPickerOpen(false);
  }

  function updateGrams(key: number, grams: string) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, grams } : row)));
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  function save() {
    setShowErrors(true);
    if (!name.trim()) return setError("Donne un nom à ta recette.");
    if (rows.length === 0) return setError("Ajoute au moins un ingrédient.");
    if (rows.some((row) => !isValidGrams(row.grams))) {
      return setError("Vérifie les quantités en rouge (en grammes).");
    }
    setError(null);

    const formData = new FormData();
    formData.set("id", recipe?.id ?? "");
    formData.set("name", name);
    formData.set("servings", String(servings));
    formData.set(
      "ingredients",
      JSON.stringify(rows.map((row) => ({ foodId: row.food.id, grams: parseGrams(row.grams) }))),
    );

    startTransition(async () => {
      const result = await saveRecipe(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(result.message ?? "Recette enregistrée.");
      router.push("/cuisine/recettes");
    });
  }

  async function remove() {
    if (!recipe) return;
    const result = await deleteRecipe(recipe.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Recette supprimée.");
    router.push("/cuisine/recettes");
  }

  return (
    <div className="flex flex-col gap-section">
      <Card className="flex flex-col gap-4">
        <TextField
          label="Nom de la recette"
          name="name"
          placeholder="Ex. Poulet, riz basmati, brocoli"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={showErrors && !name.trim() ? "Indique un nom." : undefined}
        />
        <Stepper
          label="Portions"
          value={servings}
          onChange={setServings}
          min={1}
          max={50}
        />
      </Card>

      <section>
        <SectionTitle>Ingrédients (poids cru, en grammes)</SectionTitle>
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const invalid = showErrors && !isValidGrams(row.grams);
            const kcal = isValidGrams(row.grams)
              ? nutrientsForGrams(row.food, parseGrams(row.grams)).kcal
              : 0;
            return (
              <div
                key={row.key}
                className="flex items-center gap-3 rounded-card bg-surface px-4 py-2.5 shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-ink">{row.food.name}</p>
                  <p className="text-footnote text-ink-muted">{formatInteger(kcal)} kcal</p>
                </div>
                <div className="relative w-24 shrink-0">
                  <input
                    aria-label={`Quantité de ${row.food.name} en grammes`}
                    inputMode="decimal"
                    value={row.grams}
                    onChange={(event) => updateGrams(row.key, event.target.value)}
                    className={`h-control w-full rounded-control bg-surface-muted pr-7 pl-3 text-right text-body text-ink outline-none focus:ring-2 focus:ring-primary ${
                      invalid ? "ring-2 ring-danger" : ""
                    }`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-callout text-ink-muted">
                    g
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Retirer ${row.food.name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-ink-subtle active:bg-surface-muted"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
            );
          })}
          <Button variant="secondary" size="lg" fullWidth onClick={() => setPickerOpen(true)}>
            <Icon name="plus" size={20} />
            Ajouter un ingrédient
          </Button>
        </div>
      </section>

      <section>
        <SectionTitle>Valeurs nutritionnelles</SectionTitle>
        <Card>
          <NutritionSummary
            perServing={nutrition.perServing}
            total={nutrition.total}
            servings={servings}
          />
        </Card>
      </section>

      {error ? <InlineError>{error}</InlineError> : null}

      <div className="flex flex-col gap-2">
        <Button size="lg" fullWidth onClick={save} pending={pending}>
          {recipe ? "Enregistrer les modifications" : "Créer la recette"}
        </Button>
        {recipe ? (
          <ConfirmButton
            variant="danger"
            size="lg"
            fullWidth
            title={`Supprimer « ${recipe.name} » ?`}
            description="La recette, son stock et sa place dans la liste de courses seront supprimés. Les repas déjà enregistrés restent dans ton journal."
            confirmLabel="Supprimer la recette"
            onConfirm={remove}
          >
            Supprimer la recette
          </ConfirmButton>
        ) : null}
      </div>

      <FoodPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        foods={foods}
        onPick={addFood}
      />
    </div>
  );
}
