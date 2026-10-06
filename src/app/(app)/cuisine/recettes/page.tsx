import type { Metadata } from "next";
import { MacroLine } from "@/components/MacroLine";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { EmptyState } from "@/components/ui/States";
import { getRecipes } from "@/lib/data/recipes";
import { formatInteger } from "@/lib/format";
import { CuisineHeader } from "../CuisineHeader";

export const metadata: Metadata = { title: "Recettes" };

export default async function RecipesPage() {
  const recipes = await getRecipes();

  return (
    <>
      <CuisineHeader
        action={
          <ButtonLink href="/cuisine/recettes/nouvelle" size="sm" aria-label="Nouvelle recette">
            <Icon name="plus" size={18} />
            Nouvelle
          </ButtonLink>
        }
      />
      {recipes.length === 0 ? (
        <EmptyState
          icon="kitchen"
          title="Ta première recette"
          description="Ajoute tes ingrédients en grammes : les macros par portion se calculent toutes seules."
          action={<ButtonLink href="/cuisine/recettes/nouvelle">Créer une recette</ButtonLink>}
        />
      ) : (
        <List>
          {recipes.map((recipe) => (
            <ListItem
              key={recipe.id}
              href={`/cuisine/recettes/${recipe.id}`}
              title={recipe.name}
              subtitle={
                <>
                  {recipe.servings} portion{recipe.servings > 1 ? "s" : ""} ·{" "}
                  <MacroLine
                    proteinG={recipe.perServing.proteinG}
                    carbsG={recipe.perServing.carbsG}
                    fatG={recipe.perServing.fatG}
                  />
                </>
              }
              trailing={`${formatInteger(recipe.perServing.kcal)} kcal`}
            />
          ))}
        </List>
      )}
    </>
  );
}
