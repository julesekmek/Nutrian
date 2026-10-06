/**
 * Variables d'environnement Supabase, lues uniquement côté serveur.
 * La clé service_role n'est jamais lue par l'application.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "SUPABASE_URL et SUPABASE_ANON_KEY doivent être définies (voir .env.example).",
    );
  }
  return { url, anonKey };
}
