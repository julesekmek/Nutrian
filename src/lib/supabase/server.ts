import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
 * Utilise la clé anon + la session de l'utilisateur : les règles RLS s'appliquent.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component : le proxy se charge de rafraîchir la session.
        }
      },
    },
  });
}

export type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;
