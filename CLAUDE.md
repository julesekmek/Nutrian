@AGENTS.md

# Nutrian

Web app mobile d'abord (390 px de référence, installable en PWA) pour un sportif qui fait du batch cooking : « Prépare, mange et bouge en phase avec ton objectif : chaque jour, tu sais où tu en es et quoi faire pour l'atteindre. »

- Source de vérité produit : `docs/cadrage-produit.md`
- Choix faits sans validation : `docs/DECISIONS.md` (à compléter à chaque hypothèse)
- Idées pour la suite : `docs/BACKLOG.md`

## Stack

- Next.js 16 (App Router, Turbopack, `src/proxy.ts` à la place du middleware), React 19, TypeScript strict
- Tailwind CSS v4 (configuration dans `src/app/globals.css`, pas de `tailwind.config`)
- Supabase : Postgres + Auth (e-mail / mot de passe) + RLS sur chaque table
- Zod pour la validation serveur ; tests avec `node --test` (TypeScript natif, aucune dépendance)
- Hébergement Render (Web Service Node, `render.yaml`)

## Structure

```
src/
  app/
    (auth)/           connexion, inscription, Server Actions d'auth
    auth/confirm/     retour du lien de confirmation d'e-mail
    onboarding/       parcours d'accueil + actions profil
    (app)/            écrans protégés avec barre d'onglets
      page.tsx        Aujourd'hui (vues Jour / Semaine, coach)
      cuisine/        stock (page), recettes, courses, aliments + actions.ts
      ajouter/        écran « + » (repas, séance, pas, pesée) + actions.ts
      activite/       dépense, pas, séances, poids
      profil/         profil, rythme de batch, déconnexion
  components/ui/      kit réutilisable (Button, Card, Field, Gauge, List, Modal, Toast, States…)
  components/         composants métier partagés (MealList, MacroLine, FoodPicker…)
  lib/
    calculations.ts   TOUTES les règles chiffrées (cibles, dépense, recettes, courses, coach) + tests
    coach.ts          formulation des recommandations
    data/             lectures Supabase (une fonction par besoin)
    validation.ts     schémas Zod des Server Actions
    dates.ts          dates ISO dans le fuseau Europe/Paris
    database.types.ts types générés depuis le schéma (ne pas éditer)
supabase/
  migrations/         schéma, RLS et données d'aliments (une migration par bloc)
  setup.sql           concaténation des migrations (généré) à coller dans le SQL Editor
  seed.sql            compte de test pour la base LOCALE uniquement
scripts/              setup.sql, icônes PWA, garde-fou anti-secrets, dev local
```

## Commandes utiles

```bash
npm run dev            # app sur http://localhost:3000 avec le Supabase distant (.env)
npx supabase start     # base Supabase locale (Docker) : applique migrations + seed
npm run dev:local      # app branchée sur la base locale
npm test               # tests du module de calcul
npm run typecheck && npm run lint
npm run build          # build de production
npm run db:setup-sql   # régénère supabase/setup.sql après une nouvelle migration
npm run db:types       # régénère src/lib/database.types.ts depuis la base locale
npm run check:secrets  # vérifie qu'aucun secret n'est suivi par Git (aussi en pre-commit)
```

## Conventions

- **Design tokens uniquement** : couleurs, typos, rayons, ombres, espacements sont définis dans `globals.css` (`--nt-*` + `@theme`). La palette Tailwind par défaut est désactivée : pas de `bg-red-500`, pas de valeur en dur. La refonte visuelle passera par ce fichier et `components/ui/`.
- **Règles chiffrées** : uniquement dans `src/lib/calculations.ts` (`RULES` + fonctions pures), avec un test pour chaque règle. Les écrans n'inventent aucun calcul.
- **Écritures** : Server Actions (`"use server"`) qui appellent `getAuthenticatedClient()`, valident avec Zod, renvoient un `ActionResult`, puis `revalidatePath("/", "layout")`. Côté client : `<ActionForm>` ou appel direct + toast.
- **Lectures** : fonctions de `src/lib/data/*` appelées depuis les Server Components.
- **Base** : chaque nouvelle table a `user_id default auth.uid()`, RLS activé, 4 règles (select/insert/update/delete) limitées à `auth.uid()`, `revoke all … from anon`. Nouvelle migration → `npm run db:setup-sql` → `npm run db:types`.
- **Textes** : français, tutoiement, ton coach encourageant (« il reste », « ajuste », « bien joué »). Jamais « dépassé » ni « échec ».
- **États** : chaque écran gère vide, chargement (`loading.tsx`), erreur (`error.tsx`) et succès (toast).
- **Git** : un commit clair par fonctionnalité, message en français.

## Secrets (non négociable)

- Les accès Supabase vivent uniquement dans `.env` (ignoré par Git). `.env.example` liste les noms sans valeurs.
- `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont lus côté serveur uniquement (aucune variable `NEXT_PUBLIC_`).
- La clé `service_role` n'est utilisée nulle part : ne jamais l'ajouter au code, au navigateur ni à Render.
- Ne jamais recopier une clé dans le code, la doc, les logs ou un message. Le hook pre-commit lance `npm run check:secrets`.

## Pièges connus

- Le serveur de dev Turbopack garde parfois une version périmée d'un module modifié (« X is not a function ») : arrêter puis relancer `npm run dev`.
- `params` et `searchParams` sont des Promises (`await`), typées avec `PageProps<"/route">`.
