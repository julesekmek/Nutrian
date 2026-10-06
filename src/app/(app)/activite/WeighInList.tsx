"use client";

import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { ConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { WeighIn } from "@/lib/data/weights";
import { formatRelativeDay } from "@/lib/dates";
import { formatDecimal } from "@/lib/format";
import { deleteWeighIn } from "../ajouter/actions";

export function WeighInList({ weighIns, today }: { weighIns: WeighIn[]; today: string }) {
  const toast = useToast();

  async function remove(weighIn: WeighIn) {
    const result = await deleteWeighIn(weighIn.id);
    if (result.ok) toast.success(result.message ?? "Pesée retirée.");
    else toast.error(result.error);
  }

  return (
    <List>
      {weighIns.map((weighIn, index) => {
        const previous = weighIns[index + 1];
        const delta = previous ? Math.round((weighIn.weightKg - previous.weightKg) * 10) / 10 : null;
        return (
          <ListItem
            key={weighIn.id}
            title={`${formatDecimal(weighIn.weightKg)} kg`}
            subtitle={
              delta === null
                ? formatRelativeDay(weighIn.day, today)
                : `${formatRelativeDay(weighIn.day, today)} · ${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${formatDecimal(Math.abs(delta))} kg`
            }
            trailing={
              <ConfirmButton
                title="Retirer cette pesée ?"
                description="Ton poids de référence reprendra la pesée précédente."
                confirmLabel="Retirer"
                ariaLabel={`Retirer la pesée du ${weighIn.day}`}
                onConfirm={() => remove(weighIn)}
              >
                <Icon name="trash" size={18} />
              </ConfirmButton>
            }
          />
        );
      })}
    </List>
  );
}
