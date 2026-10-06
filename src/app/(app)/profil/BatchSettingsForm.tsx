"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Field";
import { updateBatchSettings } from "../../onboarding/actions";

export function BatchSettingsForm({
  batchesPerWeek,
  stockPortionsPerDay,
}: {
  batchesPerWeek: number;
  stockPortionsPerDay: number;
}) {
  const [batches, setBatches] = useState(batchesPerWeek);
  const [portions, setPortions] = useState(stockPortionsPerDay);

  return (
    <ActionForm action={updateBatchSettings} resetOnSuccess={false}>
      {({ pending }) => (
        <>
          <input type="hidden" name="batchesPerWeek" value={batches} />
          <input type="hidden" name="stockPortionsPerDay" value={portions} />
          <Stepper
            label="Batchs par semaine"
            value={batches}
            onChange={setBatches}
            min={1}
            max={7}
          />
          <Stepper
            label="Portions du stock par jour"
            value={portions}
            onChange={setPortions}
            min={1}
            max={6}
          />
          <p className="text-footnote text-ink-muted">
            Sert à te dire combien de portions préparer pour tenir jusqu&apos;au prochain batch.
          </p>
          <Button type="submit" variant="secondary" size="lg" fullWidth pending={pending}>
            Enregistrer
          </Button>
        </>
      )}
    </ActionForm>
  );
}
