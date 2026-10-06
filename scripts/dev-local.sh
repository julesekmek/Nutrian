#!/bin/sh
# Lance l'app en développement sur la base Supabase LOCALE (Docker, `npx supabase start`)
# au lieu du projet Supabase distant défini dans .env. Usage : npm run dev:local
set -e
eval "$(npx supabase@2 status -o env 2>/dev/null | grep -E '^(API_URL|ANON_KEY)=')"
if [ -z "$API_URL" ]; then
  echo "Supabase local n'est pas démarré : lance d'abord 'npx supabase start'." >&2
  exit 1
fi
SUPABASE_URL="$API_URL" SUPABASE_ANON_KEY="$ANON_KEY" exec npx next dev "$@"
