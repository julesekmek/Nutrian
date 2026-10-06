# Nutrian

Prépare, mange et bouge en phase avec ton objectif : chaque jour, tu sais où tu en es et quoi faire pour l'atteindre.

Web app mobile d'abord (installable sur l'écran d'accueil) : objectif et cible quotidienne, recettes et macros, stock de plats préparés, liste de courses, journal des repas en 2 gestes, activité, pesées, tableau de bord et recommandations du coach.

## Démarrer en local

```bash
npm install
cp .env.example .env   # puis renseigner SUPABASE_URL et SUPABASE_ANON_KEY
npm run dev            # http://localhost:3000
```

La base Supabase doit avoir été initialisée une fois avec `supabase/setup.sql` (SQL Editor).

Pour travailler sur une base locale jetable (Docker) : `npx supabase start` puis `npm run dev:local`.

## Documentation

- [CLAUDE.md](CLAUDE.md) : stack, structure, commandes, conventions, règles de secrets
- [docs/cadrage-produit.md](docs/cadrage-produit.md) : cadrage produit
- [docs/DECISIONS.md](docs/DECISIONS.md) : hypothèses et choix
- [docs/BACKLOG.md](docs/BACKLOG.md) : prochaines itérations
