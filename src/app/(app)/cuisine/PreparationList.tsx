"use client";

import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { ConfirmButton } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Preparation } from "@/lib/data/stock";
import { formatRelativeDay } from "@/lib/dates";
import { formatPortions } from "@/lib/format";
import { deletePreparation } from "./actions";

export function PreparationList({
  preparations,
  today,
}: {
  preparations: Preparation[];
  today: string;
}) {
  const toast = useToast();

  async function remove(preparation: Preparation) {
    const result = await deletePreparation(preparation.id);
    if (result.ok) toast.success(result.message ?? "Préparation retirée.");
    else toast.error(result.error);
  }

  return (
    <List>
      {preparations.map((preparation) => (
        <ListItem
          key={preparation.id}
          title={preparation.recipeName}
          subtitle={`${formatRelativeDay(preparation.preparedOn, today)} · ${formatPortions(preparation.portions)}`}
          trailing={
            <ConfirmButton
              title="Retirer cette préparation ?"
              description="Ses portions seront retirées du stock. Utile en cas d'erreur de saisie."
              confirmLabel="Retirer"
              ariaLabel={`Retirer la préparation ${preparation.recipeName}`}
              onConfirm={() => remove(preparation)}
            >
              <Icon name="trash" size={18} />
            </ConfirmButton>
          }
        />
      ))}
    </List>
  );
}
