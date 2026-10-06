"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { ActionResult } from "@/lib/action-result";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<ActionResult>;
  notice?: string;
};

export function AuthForm({ mode, action, notice }: AuthFormProps) {
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const isLogin = mode === "login";

  if (confirmation) {
    return (
      <Card className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Icon name="check" />
        </div>
        <p className="text-headline text-ink">{confirmation}</p>
        <Link href="/login" className="text-callout font-semibold text-primary">
          Aller à la connexion
        </Link>
      </Card>
    );
  }

  return (
    <Card>
      {notice ? (
        <p className="mb-4 rounded-control bg-primary-soft px-3 py-2 text-callout text-primary">
          {notice}
        </p>
      ) : null}
      <ActionForm
        action={action}
        resetOnSuccess={false}
        onSuccess={(result) => setConfirmation(result.message ?? "C'est fait !")}
      >
        {({ fieldErrors, pending }) => (
          <>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              error={fieldErrors.email}
            />
            <TextField
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={8}
              hint={isLogin ? undefined : "8 caractères minimum."}
              error={fieldErrors.password}
            />
            <Button type="submit" size="lg" fullWidth pending={pending}>
              {isLogin ? "Se connecter" : "Créer mon compte"}
            </Button>
          </>
        )}
      </ActionForm>
      <p className="mt-5 text-center text-callout text-ink-muted">
        {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-semibold text-primary">
          {isLogin ? "Inscris-toi" : "Connecte-toi"}
        </Link>
      </p>
    </Card>
  );
}
