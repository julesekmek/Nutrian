import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { StepsForm } from "@/components/StepsForm";
import { WeighInForm } from "@/components/WeighInForm";
import { ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SegmentedLinks } from "@/components/ui/SegmentedLinks";
import { EmptyState } from "@/components/ui/States";
import { getActivity } from "@/lib/data/activity";
import { getProfile } from "@/lib/data/profile";
import { getStock } from "@/lib/data/stock";
import { dayFromChoice } from "@/lib/dates";
import { QuickMealForm } from "./QuickMealForm";
import { StockPicker } from "./StockPicker";
import { WorkoutForm } from "./WorkoutForm";

export const metadata: Metadata = { title: "Ajouter" };

type Day = "today" | "yesterday";
type Tab = "repas" | "seance" | "pas" | "pesee";

const TABS: { value: Tab; label: string }[] = [
  { value: "repas", label: "Repas" },
  { value: "seance", label: "Séance" },
  { value: "pas", label: "Pas" },
  { value: "pesee", label: "Pesée" },
];

function buildHref(tab: Tab, day: Day) {
  const params = new URLSearchParams();
  if (tab !== "repas") params.set("onglet", tab);
  if (day === "yesterday") params.set("jour", "hier");
  const query = params.toString();
  return query ? `/ajouter?${query}` : "/ajouter";
}

export default async function AddPage({ searchParams }: PageProps<"/ajouter">) {
  const params = await searchParams;
  const day: Day = params.jour === "hier" ? "yesterday" : "today";
  const tab: Tab = TABS.some((item) => item.value === params.onglet)
    ? (params.onglet as Tab)
    : "repas";

  return (
    <>
      <PageHeader
        title="Ajouter"
        action={
          <Link
            href="/"
            aria-label="Fermer"
            className="flex size-9 items-center justify-center rounded-full bg-surface text-ink-muted shadow-card"
          >
            <Icon name="close" size={18} />
          </Link>
        }
      />

      <div className="flex flex-col gap-section">
        <div className="flex flex-col gap-2">
          <SegmentedLinks
            label="Type de saisie"
            items={TABS.map((item) => ({
              href: buildHref(item.value, day),
              label: item.label,
              active: item.value === tab,
            }))}
          />
          <SegmentedLinks
            label="Jour"
            size="sm"
            items={[
              { href: buildHref(tab, "today"), label: "Aujourd'hui", active: day === "today" },
              { href: buildHref(tab, "yesterday"), label: "Hier", active: day === "yesterday" },
            ]}
          />
        </div>

        {tab === "repas" ? (
          <MealTab day={day} highlightRecipeId={typeof params.plat === "string" ? params.plat : null} />
        ) : null}
        {tab === "seance" ? <WorkoutTab day={day} /> : null}
        {tab === "pas" ? <StepsTab day={day} /> : null}
        {tab === "pesee" ? <WeighInTab day={day} /> : null}
      </div>
    </>
  );
}

async function MealTab({ day, highlightRecipeId }: { day: Day; highlightRecipeId: string | null }) {
  const stock = (await getStock())
    .filter((item) => item.portionsLeft >= 1)
    .sort((a, b) => Number(b.recipeId === highlightRecipeId) - Number(a.recipeId === highlightRecipeId));
  return (
    <>
      <section>
        <SectionTitle>Depuis ton stock</SectionTitle>
        {stock.length === 0 ? (
          <EmptyState
            icon="kitchen"
            title="Rien au frais pour l'instant"
            description="Enregistre ton batch dans Cuisine pour piocher tes portions en un geste."
            action={
              <ButtonLink href="/cuisine" variant="secondary">
                Aller en cuisine
              </ButtonLink>
            }
          />
        ) : (
          <StockPicker items={stock} day={day} highlightRecipeId={highlightRecipeId} />
        )}
      </section>
      <section>
        <SectionTitle>Repas extérieur</SectionTitle>
        <Card>
          <QuickMealForm day={day} />
        </Card>
      </section>
    </>
  );
}

async function WorkoutTab({ day }: { day: Day }) {
  const profile = await getProfile();
  return (
    <Card>
      <WorkoutForm day={day} weightKg={profile?.weightKg ?? 70} />
    </Card>
  );
}

async function StepsTab({ day }: { day: Day }) {
  const date = dayFromChoice(day);
  const activity = await getActivity(date, date);
  return (
    <Card>
      <StepsForm day={day} currentSteps={activity.stepsByDay.get(date) ?? null} redirectTo="/" />
    </Card>
  );
}

async function WeighInTab({ day }: { day: Day }) {
  const profile = await getProfile();
  return (
    <Card>
      <WeighInForm day={day} lastWeightKg={profile?.weightKg ?? null} redirectTo="/" />
    </Card>
  );
}
