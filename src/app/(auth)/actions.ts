"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  failure,
  success,
  validationFailure,
  type ActionResult,
} from "@/lib/action-result";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { credentialsSchema, formDataToObject } from "@/lib/validation";

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "E-mail ou mot de passe incorrect.",
  email_not_confirmed: "Confirme ton e-mail avec le lien reçu, puis connecte-toi.",
  user_already_exists: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  email_exists: "Un compte existe déjà avec cet e-mail. Connecte-toi.",
  weak_password: "Mot de passe trop faible : 8 caractères minimum, mélange lettres et chiffres.",
  over_email_send_rate_limit: "Trop de tentatives. Réessaie dans quelques minutes.",
  over_request_rate_limit: "Trop de tentatives. Réessaie dans quelques minutes.",
  signup_disabled: "Les inscriptions sont fermées sur ce projet Supabase.",
};

function authErrorMessage(code: string | undefined) {
  return (code && AUTH_ERRORS[code]) || "Connexion impossible pour le moment. Réessaie.";
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return failure(authErrorMessage(error.code));

  redirect("/");
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error);

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return failure(authErrorMessage(error.code));

  // Confirmation d'e-mail activée sur Supabase : pas encore de session.
  if (!data.session) {
    return success("Compte créé ! Ouvre le lien reçu par e-mail pour l'activer.");
  }
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
