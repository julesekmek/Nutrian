# Backlog

Idées et améliorations repérées pendant la V1, à prioriser pour les prochaines itérations.

## Design

- **Refonte visuelle à partir des maquettes Claude Design** : reprendre `src/app/globals.css` (tokens couleurs, typographies, rayons, espacements) puis les composants de `src/components/ui/`. Les écrans n'utilisent aucune valeur en dur.
- Logo et icônes d'application définitifs (remplacer `scripts/generate-icons.mjs`).

## Aliments

- Import complet de la table Ciqual (ANSES, ≈ 3 000 aliments, fichier CSV public) via un script SQL.
- Recherche Open Food Facts par nom de produit (puis scan de code-barres, hors périmètre V1).
- Modifier un aliment perso (aujourd'hui : supprimer puis recréer).
- Aliments favoris / récents en tête de liste.

## Cuisine

- Conversion des grammes en unités pratiques pour les courses (œufs, pièces, conditionnements).
- Déduire de la liste de courses ce qui reste en placard (inventaire simple).
- Ajuster le stock sans supprimer de préparation (ex. « j'ai jeté une portion »).
- Dupliquer une recette, photos de plats, étapes de préparation.
- Date de péremption des portions et alerte « à manger en premier ».

## Dashboard et coach

- Nuancer « en phase » : un déficit très important (ou une journée incomplète) ne devrait pas être affiché comme idéal.
- Historique des cibles (poids du jour de la pesée) pour une vue semaine exacte sur le passé.
- Vue mois et tendance de poids lissée (moyenne mobile).
- Notifications / rappels (pesée hebdo, batch du dimanche).
