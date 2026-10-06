# Nutrian — Cadrage produit

Mode de cadrage : Standard · Niveau technique visé : App en ligne (Supabase + Render) · Support : web app responsive, mobile d'abord

## 1. Fiche produit

- **Problème** : suivre ce qu'on mange et ce qu'on dépense par rapport à un objectif corporel demande de jongler entre tableur et notes, sans lien entre ce qu'on prépare, ce qu'on mange et ce qu'on brûle.
- **Pour qui, dans quelle situation** : un sportif qui prépare ses repas à l'avance (batch cooking), en phase de prise de masse, de maintien ou de perte de gras. Usage quotidien sur mobile (après un repas, après une séance) et hebdomadaire pour planifier préparations et courses.
- **Solution actuelle et limites** : tableur et notes. Saisie chronophage, macros calculées à la main, aucune visibilité sur l'écart à l'objectif, courses déconnectées des recettes.
- **Promesse** : « Prépare, mange et bouge en phase avec ton objectif : chaque jour, tu sais où tu en es et quoi faire pour l'atteindre. »
- **Fonctionnalités clés (MVP)** :
  1. Onboarding : profil (âge, sexe, taille, poids, niveau d'activité) + objectif (prise de masse / maintien / perte de gras) → cible quotidienne en kcal et macros (protéines, glucides, lipides).
  2. Cuisine : recettes avec ingrédients, macros calculées automatiquement depuis une base d'aliments (ex. Ciqual, Open Food Facts) ; stock de plats préparés en portions ; liste de courses générée à partir des recettes à préparer.
  3. Apports : journal des repas en piochant une portion dans le stock (décrément automatique du stock) + ajout rapide pour les repas hors préparation (restaurant, snack, fruit).
  4. Dépenses : saisie manuelle des pas et des séances (type : musculation, course, CrossFit ; kcal dépensées).
  5. Dashboard : bilan du jour et de la semaine vs objectif (surplus / maintien / déficit) avec recommandations concrètes (« il te manque 40 g de protéines », « prépare 3 portions de plus cette semaine ») + pesée hebdomadaire pour suivre la progression et réajuster la cible.
- **Hors périmètre du MVP** : synchronisation montre ou appli santé (Apple Santé, Garmin, Strava), scan de code-barres, multi-utilisateurs ou partage, application native sur les stores, conseil médical (les cibles sont des estimations).
- **Signal de succès** : l'app remplace le tableur ; saisie au moins 6 jours sur 7 pendant un mois ; un repas enregistré en moins de 15 secondes.
- **Support** : web app responsive, pensée mobile d'abord, ajoutable à l'écran d'accueil du téléphone ; les sessions de planification peuvent se faire sur un écran plus grand.

## 2. Carte d'identité

- **Nom** : Nutrian (nu-tri-an) — nutrition, avec le « tri » des trois piliers : cuisiner, manger, bouger.
- **3 adjectifs d'impression** : minimaliste, professionnel, motivant.
- **Ton** : coach direct et encourageant, en tutoiement. Chiffres clairs, jamais de culpabilisation. Exemple : « Encore 40 g de protéines pour boucler ta journée. »
- **Inspirations** :
  - Apple Santé / Fitness : typographie nette, cartes de dashboard aérées, anneaux de progression, hiérarchie claire de l'information.
  - Decathlon : énergie sportive accessible, couleurs franches, pictogrammes simples et lisibles, le sport à la portée de tous.
  - Mélange visé : la rigueur d'Apple avec la chaleur dynamique d'une marque sport, et un branding qui donne envie.
- **Contraintes** : aucune couleur ni aucun logo imposé.

## 3. Persona — Jules, sportif hybride et organisé

- **Qui** : product manager, à l'aise avec les données. Pratique la musculation, la course et le CrossFit ; objectif corporel qui varie selon les périodes (masse, maintien, sèche).
- **Contexte d'usage** : deux sessions de batch cooking par semaine (planification des recettes, portions et courses, parfois sur grand écran) ; saisies éclair sur mobile après un repas ou une séance ; coup d'œil au dashboard le matin ou le soir.
- **Frustration principale** : le tableur prend trop de temps, les macros se calculent à la main, l'écart à l'objectif est invisible, et il ne sait jamais combien de portions préparer.
- **Objectif** : atteindre sa cible sans que le suivi devienne une corvée ; savoir quoi préparer et quoi manger pour y arriver.
- **Ce qu'il doit ressentir** : maîtrise et motivation, jamais de culpabilité. Un écart = une information + une piste d'ajustement, pas un voyant rouge.
- **Aisance numérique** : élevée ; veut l'essentiel d'abord, le détail à la demande.
- **Ce qu'il ne veut pas** : des saisies trop longues ; de la culpabilisation.
- **Conséquences pour le produit** :
  - un repas ou une séance s'enregistre en 1 à 2 gestes, en moins de 15 secondes ;
  - vocabulaire positif (« il reste », « ajuste », « bien joué ») plutôt que « dépassé » ou « échec » ;
  - séances typées : musculation, course, CrossFit.

## 4. Décisions de cadrage

- Application pour un seul utilisateur au départ (un compte, pas de partage).
- Valeurs nutritionnelles calculées depuis les ingrédients via une base d'aliments.
- Activité saisie manuellement dans le MVP ; une synchronisation pourra venir plus tard.
- Ajout rapide des repas extérieurs et pesée hebdomadaire inclus dans le MVP.
- Documents facultatifs (vision board, parcours actuel, benchmark) : non retenus.
