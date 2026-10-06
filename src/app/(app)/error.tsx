"use client";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="pt-10">
      <ErrorState
        description="Les données n'ont pas pu être chargées. Vérifie ta connexion puis réessaie."
        action={
          <Button variant="secondary" onClick={() => reset()}>
            Réessayer
          </Button>
        }
      />
    </div>
  );
}
