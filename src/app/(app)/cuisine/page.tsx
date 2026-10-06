import type { Metadata } from "next";
import { MacroLine } from "@/components/MacroLine";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader, SectionTitle } from "@/components/ui/Card";
import { List, ListItem } from "@/components/ui/List";
import { EmptyState } from "@/components/ui/States";
import { stockCoverageDays } from "@/lib/calculations";
import { getProfile } from "@/lib/data/profile";
import { getRecipes } from "@/lib/data/recipes";
import { getRecentPreparations, getStock } from "@/lib/data/stock";
import { todayIso } from "@/lib/dates";
import { formatDecimal, formatInteger, formatPortions } from "@/lib/format";
import { CuisineHeader } from "./CuisineHeader";
import { PreparationForm } from "./PreparationForm";
import { PreparationList } from "./PreparationList";

export const metadata: Metadata = { title: "Stock" };

export default async function StockPage() {
  const [stock, recipes, preparations, profile] = await Promise.all([
    getStock(),
    getRecipes(),
    getRecentPreparations(),
    getProfile(),
  ]);
  const today = todayIso();
  const inStock = stock.filter((item) => item.portionsLeft > 0);
  const totalPortions = inStock.reduce((sum, item) => sum + item.portionsLeft, 0);
  const coverage = stockCoverageDays(totalPortions, profile?.stockPortionsPerDay ?? 2);

  if (recipes.length === 0) {
    return (
      <>
        <CuisineHeader />
        <EmptyState
          icon="kitchen"
          title="Ton stock est vide"
          description="Crée d'abord une recette, puis enregistre ta préparation après ton batch cooking."
          action={<ButtonLink href="/cuisine/recettes/nouvelle">Créer une recette</ButtonLink>}
        />
      </>
    );
  }

  return (
    <>
      <CuisineHeader />
      <div className="flex flex-col gap-section">
        <Card>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="text-display text-ink">{formatInteger(totalPortions)}</p>
              <p className="text-callout text-ink-muted">
                portion{totalPortions > 1 ? "s" : ""} prête{totalPortions > 1 ? "s" : ""}
              </p>
            </div>
            <p className="text-right text-callout text-ink-muted">
              {totalPortions > 0 ? (
                <>
                  De quoi tenir
                  <br />
                  <span className="text-headline text-ink">
                    ~{formatDecimal(Math.round(coverage * 2) / 2)} jour{coverage >= 2 ? "s" : ""}
                  </span>
                </>
              ) : (
                "C'est le moment de lancer un batch."
              )}
            </p>
          </div>
        </Card>

        <section>
          <SectionTitle>En stock</SectionTitle>
          {inStock.length === 0 ? (
            <EmptyState
              icon="kitchen"
              title="Aucun plat au frais"
              description="Enregistre ta prochaine préparation juste en dessous."
            />
          ) : (
            <List>
              {inStock.map((item) => (
                <ListItem
                  key={item.recipeId}
                  href={`/cuisine/recettes/${item.recipeId}`}
                  title={item.name}
                  subtitle={
                    <>
                      {formatInteger(item.perServing.kcal)} kcal ·{" "}
                      <MacroLine
                        proteinG={item.perServing.proteinG}
                        carbsG={item.perServing.carbsG}
                        fatG={item.perServing.fatG}
                      />
                    </>
                  }
                  trailing={
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-footnote font-semibold text-primary">
                      {formatPortions(item.portionsLeft)}
                    </span>
                  }
                />
              ))}
            </List>
          )}
        </section>

        <section>
          <SectionTitle>J&apos;ai cuisiné</SectionTitle>
          <Card>
            <CardHeader
              title="Enregistrer une préparation"
              subtitle="Les portions s'ajoutent au stock, puis se déduisent quand tu les manges."
            />
            <PreparationForm
              recipes={recipes.map(({ id, name, servings }) => ({ id, name, servings }))}
              today={today}
            />
          </Card>
        </section>

        {preparations.length > 0 ? (
          <section>
            <SectionTitle>Dernières préparations</SectionTitle>
            <PreparationList preparations={preparations} today={today} />
          </section>
        ) : null}
      </div>
    </>
  );
}
