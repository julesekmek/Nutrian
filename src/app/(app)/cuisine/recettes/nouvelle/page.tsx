import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { getFoods } from "@/lib/data/foods";
import { RecipeEditor } from "../RecipeEditor";

export const metadata: Metadata = { title: "Nouvelle recette" };

export default async function NewRecipePage() {
  const foods = await getFoods();
  return (
    <>
      <PageHeader title="Nouvelle recette" backHref="/cuisine/recettes" backLabel="Recettes" />
      <RecipeEditor foods={foods} />
    </>
  );
}
