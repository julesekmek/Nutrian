"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { SelectField, Stepper, TextField } from "@/components/ui/Field";
import { createPreparation } from "./actions";

type RecipeOption = { id: string; name: string; servings: number };

/** Enregistre une préparation : la recette cuisinée et le nombre de portions produites. */
export function PreparationForm({ recipes, today }: { recipes: RecipeOption[]; today: string }) {
  const [recipeId, setRecipeId] = useState(recipes[0]?.id ?? "");
  const [portions, setPortions] = useState(recipes[0]?.servings ?? 4);

  function selectRecipe(id: string) {
    setRecipeId(id);
    setPortions(recipes.find((recipe) => recipe.id === id)?.servings ?? 4);
  }

  return (
    <ActionForm action={createPreparation} resetOnSuccess={false}>
      {({ fieldErrors, pending }) => (
        <>
          <SelectField
            label="Plat cuisiné"
            name="recipeId"
            value={recipeId}
            onChange={(event) => selectRecipe(event.target.value)}
            options={recipes.map((recipe) => ({ value: recipe.id, label: recipe.name }))}
            error={fieldErrors.recipeId}
          />
          <input type="hidden" name="portions" value={portions} />
          <Stepper
            label="Portions produites"
            value={portions}
            onChange={setPortions}
            min={1}
            max={100}
          />
          <TextField
            label="Date de préparation"
            name="preparedOn"
            type="date"
            defaultValue={today}
            max={today}
            error={fieldErrors.preparedOn}
          />
          <Button type="submit" size="lg" fullWidth pending={pending}>
            Ajouter au stock
          </Button>
        </>
      )}
    </ActionForm>
  );
}
