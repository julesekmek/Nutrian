# Backlog

Idées et améliorations repérées pendant la V1, à prioriser pour les prochaines itérations.

## Prochaines itérations recommandées

1. **Refonte visuelle à partir des maquettes Claude Design** : reprendre `src/app/globals.css` (tokens couleurs, typographies, rayons, espacements, mode sombre) puis les composants de `src/components/ui/`. Les écrans n'utilisent aucune valeur en dur. Remplacer aussi le logo et les icônes (`scripts/generate-icons.mjs`).
2. **Saisie encore plus rapide** : favoris et « refaire comme hier », demi-portion, ajout rapide d'un aliment de la base en grammes (fruit, skyr, whey) dans l'écran « + ».
3. **Base d'aliments complète** : import de la table Ciqual (≈ 3 000 aliments), puis recherche Open Food Facts par nom.
4. **PWA hors ligne** : service worker, file d'attente des saisies sans réseau, rappels (pesée hebdo, batch du dimanche).
5. **Coach plus fin** : historique des cibles au poids du jour, nuance « en phase » (déficit trop fort, journée incomplète), tendance de poids lissée et ajustement automatique de la cible si la progression stagne.

## Design

- Logo et icônes d'application définitifs.
- Graphiques plus riches (semaine en barres, poids sur 3 mois).

## Aliments

- Import complet de la table Ciqual (ANSES, fichier CSV public) via un script SQL.
- Recherche Open Food Facts par nom de produit (puis scan de code-barres, hors périmètre V1).
- Modifier un aliment perso (aujourd'hui : supprimer puis recréer).
- Aliments favoris / récents en tête de liste.

## Cuisine

- Conversion des grammes en unités pratiques pour les courses (œufs, pièces, conditionnements).
- Déduire de la liste de courses ce qui reste en placard (inventaire simple).
- Ajuster le stock sans supprimer de préparation (ex. « j'ai jeté une portion »).
- Dupliquer une recette, photos de plats, étapes de préparation.
- Date de péremption des portions et alerte « à manger en premier ».

## Journal et activité

- Modifier un repas ou une séance (aujourd'hui : supprimer puis ressaisir).
- Saisie sur une date quelconque (aujourd'hui : aujourd'hui ou hier).
- Synchronisation montre / Apple Santé / Strava (hors périmètre V1).

## Dashboard et coach

- Nuancer « en phase » : un déficit très important (ou une journée incomplète) ne devrait pas être affiché comme idéal.
- Historique des cibles (poids du jour de la pesée) pour une vue semaine exacte sur le passé.
- Vue mois et tendance de poids lissée (moyenne mobile).
- Notifications / rappels (pesée hebdo, batch du dimanche).

## Technique

- Tests de bout en bout (Playwright) sur la base Supabase locale.
- Réactiver Cache Components de Next 16 si les temps de chargement le justifient.
- Rendre la vérification de session plus stricte (`getUser`) si l'app devient multi-utilisateurs.
