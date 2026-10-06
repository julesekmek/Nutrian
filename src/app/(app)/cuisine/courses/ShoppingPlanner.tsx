"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ConfirmButton } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { aggregateShoppingList } from "@/lib/calculations";
import { formatWeight } from "@/lib/format";
import { categoryLabel, categoryOrder, type FoodCategory } from "@/lib/foods";
import {
  clearShoppingList,
  completeBatch,
  setPlanPortions,
  toggleShoppingCheck,
} from "../actions";

export type PlannerRecipe = {
  id: string;
  name: string;
  servings: number;
  ingredients: { foodId: string; foodName: string; category: FoodCategory; grams: number }[];
};

type ShoppingItem = { foodId: string; name: string; category: FoodCategory; grams: number };

export function ShoppingPlanner({
  recipes,
  initialPlan,
  initialChecked,
  suggestedPortions,
}: {
  recipes: PlannerRecipe[];
  initialPlan: Record<string, number>;
  initialChecked: string[];
  suggestedPortions: number | null;
}) {
  const toast = useToast();
  const [plan, setPlan] = useState(initialPlan);
  const [checked, setChecked] = useState(() => new Set(initialChecked));
  const [completing, startCompleting] = useTransition();
  const [, startSaving] = useTransition();

  const plannedPortions = Object.values(plan).reduce((sum, portions) => sum + portions, 0);

  const items = useMemo<ShoppingItem[]>(() => {
    const gramsByFood = aggregateShoppingList(
      recipes.map((recipe) => ({
        servings: recipe.servings,
        portionsToPrepare: plan[recipe.id] ?? 0,
        ingredients: recipe.ingredients,
      })),
    );
    const foods = new Map(
      recipes.flatMap((recipe) =>
        recipe.ingredients.map((ingredient) => [ingredient.foodId, ingredient] as const),
      ),
    );
    return [...gramsByFood.entries()]
      .map(([foodId, grams]) => {
        const food = foods.get(foodId)!;
        return { foodId, name: food.foodName, category: food.category, grams };
      })
      .sort(
        (a, b) =>
          categoryOrder(a.category) - categoryOrder(b.category) || a.name.localeCompare(b.name, "fr"),
      );
  }, [recipes, plan]);

  const groups = useMemo(() => {
    const byCategory = new Map<FoodCategory, ShoppingItem[]>();
    for (const item of items) {
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
    }
    return [...byCategory.entries()];
  }, [items]);

  const checkedCount = items.filter((item) => checked.has(item.foodId)).length;

  function changePortions(recipeId: string, portions: number) {
    setPlan((current) => {
      const next = { ...current };
      if (portions === 0) delete next[recipeId];
      else next[recipeId] = portions;
      return next;
    });
    startSaving(async () => {
      const result = await setPlanPortions(recipeId, portions);
      if (!result.ok) toast.error(result.error);
    });
  }

  function toggle(foodId: string) {
    const isChecked = !checked.has(foodId);
    setChecked((current) => {
      const next = new Set(current);
      if (isChecked) next.add(foodId);
      else next.delete(foodId);
      return next;
    });
    startSaving(async () => {
      const result = await toggleShoppingCheck(foodId, isChecked);
      if (!result.ok) toast.error(result.error);
    });
  }

  async function clear() {
    const result = await clearShoppingList();
    if (!result.ok) return toast.error(result.error);
    setPlan({});
    setChecked(new Set());
    toast.success(result.message ?? "Liste vidée.");
  }

  function complete() {
    startCompleting(async () => {
      const result = await completeBatch();
      if (!result.ok) return toast.error(result.error);
      setPlan({});
      setChecked(new Set());
      toast.success(result.message ?? "Batch ajouté au stock.");
    });
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Pas encore de recette"
        description="Crée tes recettes : la liste de courses se construit à partir d'elles."
      />
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <section>
        <SectionTitle>Mon prochain batch</SectionTitle>
        <Card className="flex flex-col gap-4">
          {suggestedPortions ? (
            <p className="rounded-control bg-primary-soft px-3 py-2 text-callout text-primary">
              Conseil : prévois environ {suggestedPortions} portions pour tenir jusqu&apos;au batch
              suivant.
            </p>
          ) : null}
          {recipes.map((recipe) => (
            <Stepper
              key={recipe.id}
              label={recipe.name}
              value={plan[recipe.id] ?? 0}
              onChange={(portions) => changePortions(recipe.id, portions)}
              min={0}
              max={100}
            />
          ))}
          <p className="text-footnote text-ink-muted">
            {plannedPortions > 0
              ? `${plannedPortions} portion${plannedPortions > 1 ? "s" : ""} au programme.`
              : "Choisis les portions à préparer pour chaque recette."}
          </p>
        </Card>
      </section>

      {items.length > 0 ? (
        <section>
          <SectionTitle>
            Liste de courses · {checkedCount}/{items.length}
          </SectionTitle>
          <div className="flex flex-col gap-4">
            {groups.map(([category, groupItems]) => (
              <div key={category}>
                <p className="mb-1.5 px-1 text-caption font-semibold text-ink-subtle">
                  {categoryLabel(category)}
                </p>
                <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card">
                  {groupItems.map((item) => {
                    const isChecked = checked.has(item.foodId);
                    return (
                      <li key={item.foodId}>
                        <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(item.foodId)}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary ${
                              isChecked
                                ? "border-success bg-success text-primary-ink"
                                : "border-line text-transparent"
                            }`}
                          >
                            <Icon name="check" size={14} strokeWidth={3} />
                          </span>
                          <span
                            className={`flex-1 text-body ${isChecked ? "text-ink-subtle line-through" : "text-ink"}`}
                          >
                            {item.name}
                          </span>
                          <span
                            className={`text-callout font-semibold ${isChecked ? "text-ink-subtle" : "text-ink"}`}
                          >
                            {formatWeight(item.grams)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {plannedPortions > 0 ? (
        <div className="flex flex-col gap-2">
          <Button size="lg" fullWidth onClick={complete} pending={completing}>
            J&apos;ai cuisiné ce batch
          </Button>
          <p className="text-center text-footnote text-ink-muted">
            Les portions prévues passent dans ton stock et la liste repart à zéro.
          </p>
          <ConfirmButton
            variant="ghost"
            size="lg"
            fullWidth
            title="Vider la liste ?"
            description="Les recettes prévues et les articles cochés seront remis à zéro."
            confirmLabel="Vider la liste"
            onConfirm={clear}
          >
            Vider la liste
          </ConfirmButton>
        </div>
      ) : null}
    </div>
  );
}
