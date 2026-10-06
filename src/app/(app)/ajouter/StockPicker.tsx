"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MacroLine } from "@/components/MacroLine";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { StockItem } from "@/lib/data/stock";
import { formatInteger, formatPortions } from "@/lib/format";
import { deleteMealEntry, logStockPortion } from "./actions";

/** Un plat du stock = un geste : il est ajouté au journal et le stock décrémenté. */
export function StockPicker({
  items,
  day,
  highlightRecipeId,
}: {
  items: StockItem[];
  day: "today" | "yesterday";
  highlightRecipeId?: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function pick(item: StockItem) {
    setPendingId(item.recipeId);
    startTransition(async () => {
      const result = await logStockPortion(item.recipeId, day);
      setPendingId(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const entryId = result.data?.entryId;
      toast.success(result.message ?? "C'est noté.", entryId
        ? {
            label: "Annuler",
            onClick: async () => {
              const undo = await deleteMealEntry(entryId);
              if (undo.ok) toast.info("Annulé, la portion est de retour en stock.");
              else toast.error(undo.error);
            },
          }
        : undefined);
      router.push("/");
    });
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const highlighted = item.recipeId === highlightRecipeId;
        return (
          <li key={item.recipeId}>
            <button
              type="button"
              onClick={() => pick(item)}
              disabled={pendingId !== null}
              className={[
                "flex w-full items-center gap-3 rounded-card px-4 py-3 text-left shadow-card transition-transform active:scale-[0.99] disabled:opacity-60",
                highlighted ? "bg-primary-soft ring-2 ring-primary" : "bg-surface",
              ].join(" ")}
            >
              <span className="min-w-0 flex-1">
                {highlighted ? (
                  <span className="mb-0.5 block text-caption font-semibold text-primary">
                    Suggestion du coach
                  </span>
                ) : null}
                <span className="block truncate text-headline text-ink">{item.name}</span>
                <span className="block text-footnote text-ink-muted">
                  {formatInteger(item.perServing.kcal)} kcal ·{" "}
                  <MacroLine
                    proteinG={item.perServing.proteinG}
                    carbsG={item.perServing.carbsG}
                    fatG={item.perServing.fatG}
                  />
                </span>
                <span className="block text-caption text-ink-subtle">
                  {formatPortions(item.portionsLeft)} en stock
                </span>
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-ink">
                {pendingId === item.recipeId ? <Spinner size={18} /> : <Icon name="plus" size={20} />}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
