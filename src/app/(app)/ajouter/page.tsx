import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { SegmentedLinks } from "@/components/ui/SegmentedLinks";
import { EmptyState } from "@/components/ui/States";
import { getStock } from "@/lib/data/stock";
import { QuickMealForm } from "./QuickMealForm";
import { StockPicker } from "./StockPicker";

export const metadata: Metadata = { title: "Ajouter" };

type Day = "today" | "yesterday";

export default async function AddPage({ searchParams }: PageProps<"/ajouter">) {
  const params = await searchParams;
  const day: Day = params.jour === "hier" ? "yesterday" : "today";
  const stock = (await getStock()).filter((item) => item.portionsLeft >= 1);

  const href = (nextDay: Day) => (nextDay === "yesterday" ? "/ajouter?jour=hier" : "/ajouter");

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
        <SegmentedLinks
          label="Jour du repas"
          items={[
            { href: href("today"), label: "Aujourd'hui", active: day === "today" },
            { href: href("yesterday"), label: "Hier", active: day === "yesterday" },
          ]}
        />

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
            <StockPicker items={stock} day={day} />
          )}
        </section>

        <section>
          <SectionTitle>Repas extérieur</SectionTitle>
          <Card>
            <QuickMealForm day={day} />
          </Card>
        </section>
      </div>
    </>
  );
}
