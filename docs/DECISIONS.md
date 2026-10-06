# Décisions prises sans validation

Hypothèses et choix faits pendant la construction de la V1. Chaque ligne peut être remise en cause : elle dit ce qui a été choisi et pourquoi.

## Socle technique

- **Next.js 16.4 (App Router) sans Cache Components.** La version générée active `cacheComponents` et `partialPrefetching`. Toutes les pages de Nutrian dépendent de la session : on garde le rendu dynamique classique, plus simple à maintenir. Réactivable plus tard.
- **Proxy (`src/proxy.ts`) à la place du middleware.** Next 16 a renommé `middleware` en `proxy`. Il rafraîchit la session Supabase et redirige vers `/login` sans session.
- **Supabase uniquement côté serveur.** Le navigateur ne parle jamais directement à Supabase : lectures dans les Server Components, écritures dans des Server Actions. Conséquence : pas de préfixe `NEXT_PUBLIC_`, les variables gardent leurs noms `SUPABASE_URL` et `SUPABASE_ANON_KEY`, et rien n'est intégré au bundle navigateur.
- **Clé `service_role` non utilisée.** Ni l'application ni les scripts n'en ont besoin (les données de base sont insérées par les migrations SQL). Elle reste uniquement dans `.env` local et ne doit pas être déclarée sur Render.
- **Fuseau horaire fixe `Europe/Paris`** pour déterminer « aujourd'hui » (le serveur Render tourne en UTC). Constante unique dans `src/lib/dates.ts`.
- **Police système** (SF Pro sur iPhone) plutôt qu'une police web : rendu Apple Santé, zéro téléchargement.
- **Mode sombre** automatique via `prefers-color-scheme` : gratuit puisque toutes les couleurs sont des tokens.
- **Icônes PWA générées par script** (`scripts/generate-icons.mjs`, sans dépendance) : provisoires en attendant le branding des maquettes.
- **Pas de service worker** : non requis pour l'ajout à l'écran d'accueil ; le mode hors ligne est au backlog.
- **Maquettes Claude Design non consultées** : le lien demande une connexion à claude.ai que je n'ai pas faite. L'interface provisoire suit la consigne (sobriété Apple Santé) ; la refonte est au backlog.

## Dépendances ajoutées

| Paquet | Pourquoi |
| --- | --- |
| `@supabase/supabase-js` | Client officiel Supabase (base, authentification). |
| `@supabase/ssr` | Gestion de la session Supabase dans les cookies avec Next.js (recommandé par Supabase). |
| `zod` | Validation des données côté serveur dans chaque Server Action, avec messages par champ. |

Outils sans dépendance ajoutée : tests avec le lanceur intégré de Node (`node --test`, TypeScript exécuté nativement), CLI Supabase lancée via `npx` pour la base locale de développement.

## Authentification

- **E-mail + mot de passe, 8 caractères minimum** (validé côté serveur avec Zod, messages d'erreur Supabase traduits).
- **Confirmation d'e-mail gérée dans les deux cas** : si elle est désactivée dans Supabase, l'inscription ouvre directement l'onboarding ; si elle est activée, un message invite à cliquer le lien, qui revient sur `/auth/confirm` puis l'onboarding. Recommandation pour un usage solo : la désactiver.
- **Base Supabase locale (Docker) pour le développement** : `npx supabase start` + `npm run dev:local`. Un compte de test local est créé par `supabase/seed.sql` (jamais exécuté sur le projet distant).
