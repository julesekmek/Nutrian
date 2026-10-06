import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SegmentedNav } from "@/components/ui/SegmentedNav";

const SEGMENTS = [
  { href: "/cuisine", label: "Stock", exact: true },
  { href: "/cuisine/recettes", label: "Recettes" },
  { href: "/cuisine/courses", label: "Courses" },
  { href: "/cuisine/aliments", label: "Aliments" },
];

/** En-tête commun des onglets de la section Cuisine. */
export function CuisineHeader({ action }: { action?: ReactNode }) {
  return (
    <>
      <PageHeader title="Cuisine" action={action} />
      <SegmentedNav segments={SEGMENTS} />
    </>
  );
}
