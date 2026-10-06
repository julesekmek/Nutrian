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

## Onboarding et profil

- **Âge stocké sous forme d'année de naissance** (`birth_year = année en cours − âge saisi`) pour que l'âge reste juste d'une année sur l'autre.
- **Cinq niveaux d'activité déclarée** avec les facteurs classiques : sédentaire 1,2 · légère 1,375 · modérée 1,55 · active 1,725 · très active 1,9. Utilisés uniquement les jours sans pas ni séance saisis.
- **Le poids actuel vit dans le profil** ; les pesées (bloc 9) le mettent à jour.
- **Cible calculée côté navigateur pendant l'onboarding** (même module de calcul que le serveur) pour l'afficher instantanément, puis le serveur revalide toutes les valeurs à l'enregistrement.
- **Valeurs arrondies** : kcal et grammes à l'unité.

## Base d'aliments

- **Base commune partagée + aliments perso** : les 185 aliments fournis ont `user_id = NULL` et sont lisibles par tout compte connecté, sans pouvoir être modifiés. Les aliments ajoutés appartiennent à `user_id = auth.uid()`. Plus simple que de recopier la base pour chaque compte.
- **185 aliments** (un peu plus que les ~150 demandés) avec des valeurs arrondies proches de Ciqual, en version crue et cuite pour les féculents et le poulet. Ce sont des repères à vérifier, pas un import officiel.
- **Import complet de Ciqual** (≈ 3 000 aliments) : piste pour plus tard, voir le backlog.
- **Énergie calculée si elle n'est pas saisie** : 4 kcal/g de protéines et de glucides, 9 kcal/g de lipides.
- **Un aliment perso utilisé dans une recette ne peut pas être supprimé** (message explicite) pour ne pas fausser les recettes.

## Recettes

- **Macros non stockées** : elles sont recalculées à chaque affichage depuis les ingrédients et la base d'aliments. Corriger un aliment corrige toutes les recettes.
- **Quantités saisies en poids cru** (indiqué dans l'écran) : c'est ainsi qu'on pèse en batch cooking et c'est ce que donnent les étiquettes. Des versions « cuit » existent pour les féculents si besoin.
- **Enregistrement atomique** via la fonction SQL `save_recipe` (SECURITY INVOKER, donc soumise aux règles RLS) : la recette et ses ingrédients sont écrits ensemble ou pas du tout.
- **1 à 50 portions, 1 à 50 ingrédients**, 4 portions proposées par défaut.
- **Supprimer une recette** supprime aussi son stock et sa place dans la liste de courses ; les repas déjà enregistrés restent dans le journal (valeurs figées au moment du repas).

## Stock de plats préparés

- **Stock calculé, jamais saisi** : portions préparées − portions mangées (vue SQL `recipe_stock`, soumise aux règles RLS via `security_invoker`). Supprimer un repas du journal remet donc automatiquement la portion en stock.
- **Corriger une erreur** = supprimer la préparation concernée (liste « Dernières préparations »).
- **Rythme de batch dans le profil** : 2 batchs par semaine et 2 portions du stock par jour par défaut (déjeuner + dîner), modifiables. Ils servent à estimer la couverture du stock et les recommandations du coach.

## Liste de courses

- **Plan du prochain batch = recettes × portions à préparer**, enregistré en base pour le retrouver sur un autre appareil (planification sur grand écran, courses sur téléphone).
- **Quantités agrégées en grammes, arrondies au gramme supérieur**, affichées en kg au-delà d'1 kg, regroupées par rayon (catégorie d'aliment). Pas de conversion en pièces/unités pour la V1.
- **Ce qui est déjà en stock ou dans les placards n'est pas déduit** de la liste : on coche ce qu'on a.
- **« J'ai cuisiné ce batch »** transforme le plan en préparations datées du jour (le stock se remplit) et remet la liste à zéro : une seule action après la session de cuisine.
