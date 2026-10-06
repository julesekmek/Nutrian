import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/** Utilisateur connecté (vérifié via le JWT Supabase), mis en cache pour la requête. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

/** À appeler en tête de chaque page protégée et de chaque Server Action. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Client Supabase + utilisateur authentifié, pour les Server Actions. */
export async function getAuthenticatedClient() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  return { supabase, user };
}
