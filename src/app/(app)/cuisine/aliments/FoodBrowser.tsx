"use client";

import { useMemo, useState } from "react";
import { MacroLine } from "@/components/MacroLine";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/Card";
import { NumberField, SearchInput, SelectField, TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { List, ListItem } from "@/components/ui/List";
import { ConfirmButton, Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { formatInteger } from "@/lib/format";
import { FOOD_CATEGORIES, categoryLabel, matchesSearch, type Food } from "@/lib/foods";
import { createFood, deleteFood } from "../actions";

function AddFoodModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Nouvel aliment">
      <ActionForm action={createFood} onSuccess={onClose}>
        {({ fieldErrors, pending }) => (
          <>
            <TextField label="Nom" name="name" placeholder="Ex. Steak haché 5 % Charal" error={fieldErrors.name} />
            <SelectField
              label="Catégorie"
              name="category"
              defaultValue="autres"
              options={FOOD_CATEGORIES.map(({ value, label }) => ({ value, label }))}
              error={fieldErrors.category}
            />
            <p className="px-1 text-footnote text-ink-muted">Valeurs pour 100 g (voir l&apos;étiquette).</p>
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Protéines" name="proteinG" suffix="g" error={fieldErrors.proteinG} />
              <NumberField label="Glucides" name="carbsG" suffix="g" error={fieldErrors.carbsG} />
              <NumberField label="Lipides" name="fatG" suffix="g" error={fieldErrors.fatG} />
            </div>
            <NumberField
              label="Énergie"
              name="kcal"
              suffix="kcal"
              hint="Laisse vide pour la calculer à partir des macros."
              error={fieldErrors.kcal}
            />
            <Button type="submit" size="lg" fullWidth pending={pending}>
              Ajouter l&apos;aliment
            </Button>
          </>
        )}
      </ActionForm>
    </Modal>
  );
}

export function FoodBrowser({ foods }: { foods: Food[] }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const groups = useMemo(() => {
    const visible = foods.filter((food) => matchesSearch(food.name, query));
    const custom = visible.filter((food) => food.isCustom);
    const byCategory = new Map<string, Food[]>();
    for (const food of visible.filter((item) => !item.isCustom)) {
      byCategory.set(food.category, [...(byCategory.get(food.category) ?? []), food]);
    }
    return [
      ...(custom.length ? [{ title: "Mes aliments", foods: custom }] : []),
      ...[...byCategory.entries()].map(([category, items]) => ({
        title: categoryLabel(category),
        foods: items,
      })),
    ];
  }, [foods, query]);

  async function handleDelete(food: Food) {
    const result = await deleteFood(food.id);
    if (result.ok) toast.success(result.message ?? "Aliment supprimé.");
    else toast.error(result.error);
  }

  return (
    <div className="flex flex-col gap-section">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Poulet, riz, skyr…" />
        </div>
        <Button onClick={() => setAdding(true)} aria-label="Ajouter un aliment">
          <Icon name="plus" size={18} />
          Ajouter
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon="search"
          title="Aucun aliment trouvé"
          description="Ajoute-le toi-même avec les valeurs de l'étiquette."
          action={<Button onClick={() => setAdding(true)}>Ajouter « {query} »</Button>}
        />
      ) : (
        groups.map((group) => (
          <section key={group.title}>
            <SectionTitle>{group.title}</SectionTitle>
            <List>
              {group.foods.map((food) => (
                <ListItem
                  key={food.id}
                  title={food.name}
                  subtitle={<MacroLine proteinG={food.proteinG} carbsG={food.carbsG} fatG={food.fatG} />}
                  trailing={
                    <span className="flex items-center gap-1">
                      {formatInteger(food.kcal)} kcal
                      {food.isCustom ? (
                        <ConfirmButton
                          title={`Supprimer « ${food.name} » ?`}
                          description="Il disparaîtra de ta base d'aliments."
                          confirmLabel="Supprimer"
                          ariaLabel={`Supprimer ${food.name}`}
                          onConfirm={() => handleDelete(food)}
                        >
                          <Icon name="trash" size={18} />
                        </ConfirmButton>
                      ) : null}
                    </span>
                  }
                />
              ))}
            </List>
          </section>
        ))
      )}

      <p className="px-1 text-footnote text-ink-subtle">
        Valeurs pour 100 g, proches de la table Ciqual (ANSES). Ce sont des repères : vérifie
        l&apos;étiquette pour les produits de marque.
      </p>

      <AddFoodModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
