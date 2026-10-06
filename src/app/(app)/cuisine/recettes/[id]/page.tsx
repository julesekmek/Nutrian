import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFoods } from "@/lib/data/foods";
import { getRecipe } from "@/lib/data/recipes";
import { uuidSchema } from "@/lib/validation";
import { RecipeEditor } from "../RecipeEditor";

export const metadata: Metadata = { title: "Recette" };

export default async function RecipePage({ params }: PageProps<"/cuisine/recettes/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const [recipe, foods] = await Promise.all([getRecipe(id), getFoods()]);
  if (!recipe) notFound();

  return (
    <>
      <PageHeader title={recipe.name} backHref="/cuisine/recettes" backLabel="Recettes" />
      <RecipeEditor key={recipe.id} foods={foods} recipe={recipe} />
    </>
  );
}
