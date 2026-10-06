-- Nutrian — script d'installation complet de la base (généré, ne pas modifier à la main).
-- Source : supabase/migrations/*.sql, concaténés dans l'ordre. Régénérer avec : npm run db:setup-sql
-- À exécuter une seule fois sur un projet Supabase vide (SQL Editor > New query > Run).

begin;

-- ===== 20261006100000_profiles.sql =====
-- Bloc 2 — Profil utilisateur (onboarding).
-- Une ligne par utilisateur ; toutes les données appartiennent à user_id = auth.uid() (RLS).

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  goal text not null check (goal in ('bulk', 'maintain', 'cut')),
  sex text not null check (sex in ('male', 'female')),
  birth_year integer not null check (birth_year between 1900 and 2100),
  height_cm numeric(5, 1) not null check (height_cm between 100 and 250),
  -- Poids actuel (mis à jour par les pesées).
  weight_kg numeric(5, 1) not null check (weight_kg between 30 and 300),
  activity_level text not null
    check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: lecture de son profil" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles: création de son profil" on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles: modification de son profil" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "profiles: suppression de son profil" on public.profiles
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.profiles from anon;
grant select, insert, update, delete on table public.profiles to authenticated;

-- ===== 20261006110000_foods.sql =====
-- Bloc 3 — Base d'aliments (valeurs pour 100 g).
-- user_id NULL : aliment de la base commune (lecture seule pour tous les comptes).
-- user_id renseigné : aliment ajouté par l'utilisateur (visible et modifiable par lui seul).

create table public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null default 'autres' check (category in (
    'viandes', 'poissons', 'oeufs', 'laitiers', 'feculents', 'legumineuses',
    'legumes', 'fruits', 'oleagineux', 'matieres_grasses', 'complements', 'autres'
  )),
  kcal_per_100g numeric(6, 1) not null check (kcal_per_100g between 0 and 950),
  protein_per_100g numeric(5, 1) not null check (protein_per_100g between 0 and 100),
  carbs_per_100g numeric(5, 1) not null check (carbs_per_100g between 0 and 100),
  fat_per_100g numeric(5, 1) not null check (fat_per_100g between 0 and 100),
  created_at timestamptz not null default now()
);

create index foods_user_id_idx on public.foods (user_id);

alter table public.foods enable row level security;

create policy "foods: lecture de la base commune et de ses aliments" on public.foods
  for select to authenticated using (user_id is null or user_id = (select auth.uid()));
create policy "foods: ajout de ses aliments" on public.foods
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "foods: modification de ses aliments" on public.foods
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "foods: suppression de ses aliments" on public.foods
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.foods from anon;
grant select, insert, update, delete on table public.foods to authenticated;

-- ===== 20261006110100_foods_seed.sql =====
-- Bloc 3 — Jeu de données initial : aliments courants pour un sportif.
-- Valeurs pour 100 g, arrondies et proches de la table Ciqual (ANSES). Ce sont des repères :
-- elles varient selon les marques et les cuissons. Import complet de Ciqual : voir docs/BACKLOG.md.
-- Colonnes : nom, catégorie, kcal, protéines (g), glucides (g), lipides (g).

insert into public.foods (user_id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g)
select null, name, category, kcal, protein, carbs, fat
from (values
  -- Viandes & volailles
  ('Blanc de poulet, cru', 'viandes', 112, 24.0, 0, 1.5),
  ('Blanc de poulet, cuit', 'viandes', 150, 30.5, 0, 3.0),
  ('Cuisse de poulet sans peau, crue', 'viandes', 125, 19.5, 0, 5.2),
  ('Poulet rôti avec peau', 'viandes', 210, 26.0, 0, 11.5),
  ('Escalope de dinde, crue', 'viandes', 108, 23.5, 0, 1.4),
  ('Blanc de dinde (tranches)', 'viandes', 105, 20.5, 1.5, 2.0),
  ('Bœuf haché 5 % MG, cru', 'viandes', 125, 21.0, 0, 5.0),
  ('Bœuf haché 15 % MG, cru', 'viandes', 213, 18.5, 0, 15.5),
  ('Rumsteck de bœuf, cru', 'viandes', 130, 22.0, 0, 4.5),
  ('Bavette de bœuf, crue', 'viandes', 140, 21.0, 0, 6.2),
  ('Rôti de bœuf, cuit', 'viandes', 180, 28.0, 0, 7.5),
  ('Filet mignon de porc, cru', 'viandes', 121, 22.0, 0, 3.5),
  ('Côte de porc, crue', 'viandes', 175, 20.0, 0, 10.5),
  ('Jambon blanc découenné', 'viandes', 115, 21.0, 0.8, 3.0),
  ('Jambon cru', 'viandes', 240, 26.0, 0.5, 15.0),
  ('Lardons nature, crus', 'viandes', 270, 16.0, 0.5, 23.0),
  ('Escalope de veau, crue', 'viandes', 110, 22.5, 0, 2.0),
  ('Gigot d''agneau, cru', 'viandes', 165, 20.0, 0, 9.5),
  ('Saucisse de Toulouse, crue', 'viandes', 280, 16.0, 1.0, 24.0),
  ('Chorizo', 'viandes', 450, 24.0, 2.0, 38.0),
  ('Magret de canard avec peau, cru', 'viandes', 290, 18.0, 0, 24.0),
  -- Poissons & fruits de mer
  ('Saumon, cru', 'poissons', 200, 20.5, 0, 13.0),
  ('Saumon fumé', 'poissons', 180, 22.0, 0.5, 10.0),
  ('Thon au naturel, égoutté', 'poissons', 115, 26.0, 0, 1.0),
  ('Thon à l''huile, égoutté', 'poissons', 190, 26.0, 0, 9.5),
  ('Steak de thon, cru', 'poissons', 110, 24.5, 0, 1.0),
  ('Cabillaud, cru', 'poissons', 77, 18.0, 0, 0.6),
  ('Colin (lieu noir), cru', 'poissons', 80, 18.0, 0, 0.9),
  ('Merlu, cru', 'poissons', 82, 17.5, 0, 1.3),
  ('Truite, crue', 'poissons', 140, 20.0, 0, 6.5),
  ('Dorade, crue', 'poissons', 110, 20.0, 0, 3.5),
  ('Maquereau, cru', 'poissons', 190, 19.0, 0, 12.5),
  ('Sardines à l''huile, égouttées', 'poissons', 210, 24.0, 0, 12.5),
  ('Crevettes cuites décortiquées', 'poissons', 95, 21.0, 0.5, 1.0),
  ('Moules cuites', 'poissons', 114, 20.3, 3.2, 2.5),
  ('Surimi', 'poissons', 108, 7.5, 15.0, 1.6),
  -- Œufs
  ('Œuf entier', 'oeufs', 140, 12.7, 0.3, 9.8),
  ('Blanc d''œuf', 'oeufs', 48, 10.5, 0.7, 0.2),
  ('Jaune d''œuf', 'oeufs', 320, 16.0, 0.5, 28.0),
  -- Produits laitiers
  ('Lait écrémé', 'laitiers', 34, 3.4, 4.8, 0.1),
  ('Lait demi-écrémé', 'laitiers', 46, 3.3, 4.8, 1.6),
  ('Lait entier', 'laitiers', 64, 3.2, 4.7, 3.6),
  ('Fromage blanc 0 %', 'laitiers', 46, 7.3, 4.1, 0.1),
  ('Fromage blanc 3 %', 'laitiers', 75, 7.0, 3.8, 3.3),
  ('Skyr nature', 'laitiers', 60, 10.5, 4.0, 0.2),
  ('Yaourt nature', 'laitiers', 55, 4.2, 5.5, 1.5),
  ('Yaourt grec 0 %', 'laitiers', 55, 10.0, 3.5, 0.2),
  ('Yaourt à la grecque nature', 'laitiers', 120, 4.5, 4.2, 9.5),
  ('Cottage cheese', 'laitiers', 98, 11.0, 3.0, 4.5),
  ('Ricotta', 'laitiers', 140, 9.0, 3.5, 10.0),
  ('Mozzarella', 'laitiers', 240, 18.0, 1.0, 18.0),
  ('Emmental', 'laitiers', 380, 28.5, 0.5, 29.0),
  ('Comté', 'laitiers', 415, 27.5, 0.5, 34.0),
  ('Parmesan', 'laitiers', 400, 35.0, 0, 28.5),
  ('Feta', 'laitiers', 265, 14.5, 1.0, 22.5),
  ('Fromage de chèvre frais', 'laitiers', 200, 11.0, 3.0, 16.0),
  ('Camembert', 'laitiers', 270, 20.0, 0.5, 21.0),
  ('Crème fraîche épaisse 30 %', 'laitiers', 292, 2.3, 3.0, 30.0),
  ('Crème légère 15 %', 'laitiers', 162, 2.8, 4.0, 15.0),
  -- Féculents & céréales
  ('Riz basmati, cru', 'feculents', 352, 8.0, 77.0, 0.8),
  ('Riz basmati, cuit', 'feculents', 140, 3.0, 31.0, 0.4),
  ('Riz complet, cru', 'feculents', 350, 7.5, 74.0, 2.7),
  ('Riz complet, cuit', 'feculents', 142, 3.3, 30.0, 1.0),
  ('Pâtes, crues', 'feculents', 352, 12.5, 71.0, 1.5),
  ('Pâtes, cuites', 'feculents', 150, 5.3, 30.5, 0.9),
  ('Pâtes complètes, crues', 'feculents', 336, 13.5, 65.0, 2.5),
  ('Pâtes complètes, cuites', 'feculents', 139, 5.5, 27.0, 1.0),
  ('Quinoa, cru', 'feculents', 366, 14.0, 64.0, 6.0),
  ('Quinoa, cuit', 'feculents', 120, 4.4, 21.0, 1.9),
  ('Semoule de blé, crue', 'feculents', 360, 12.5, 72.0, 1.5),
  ('Boulgour, cru', 'feculents', 341, 12.0, 70.0, 1.5),
  ('Flocons d''avoine', 'feculents', 365, 13.5, 59.0, 7.0),
  ('Muesli sans sucres ajoutés', 'feculents', 360, 10.0, 60.0, 8.0),
  ('Pain complet', 'feculents', 240, 9.0, 43.0, 3.0),
  ('Baguette', 'feculents', 272, 9.0, 56.0, 1.3),
  ('Pain de mie complet', 'feculents', 252, 9.0, 44.0, 4.5),
  ('Pain aux céréales', 'feculents', 260, 10.0, 44.0, 5.0),
  ('Tortilla de blé', 'feculents', 305, 8.5, 51.0, 7.5),
  ('Pomme de terre, crue', 'feculents', 78, 2.0, 16.5, 0.1),
  ('Pomme de terre, cuite à l''eau', 'feculents', 80, 1.9, 17.0, 0.1),
  ('Patate douce, crue', 'feculents', 86, 1.6, 18.5, 0.1),
  ('Galettes de riz soufflé', 'feculents', 385, 8.0, 80.0, 3.0),
  ('Farine de blé T55', 'feculents', 345, 10.0, 72.0, 1.2),
  ('Polenta, crue', 'feculents', 360, 8.5, 75.0, 1.5),
  ('Nouilles de riz, crues', 'feculents', 360, 6.0, 80.0, 0.6),
  ('Gnocchi de pomme de terre', 'feculents', 150, 3.6, 32.0, 0.3),
  ('Maïs doux en conserve, égoutté', 'feculents', 95, 2.9, 16.5, 1.4),
  -- Légumineuses & soja
  ('Lentilles vertes, crues', 'legumineuses', 320, 24.0, 48.0, 1.5),
  ('Lentilles vertes, cuites', 'legumineuses', 116, 9.0, 17.0, 0.4),
  ('Lentilles corail, crues', 'legumineuses', 340, 24.0, 52.0, 2.0),
  ('Pois chiches, cuits', 'legumineuses', 130, 7.0, 17.5, 2.5),
  ('Haricots rouges, cuits', 'legumineuses', 115, 8.0, 15.5, 0.5),
  ('Haricots blancs, cuits', 'legumineuses', 110, 7.0, 15.0, 0.5),
  ('Pois cassés, crus', 'legumineuses', 335, 23.0, 52.0, 1.5),
  ('Tofu ferme', 'legumineuses', 130, 13.0, 1.5, 8.0),
  ('Tempeh', 'legumineuses', 200, 19.0, 9.0, 11.0),
  ('Edamame', 'legumineuses', 122, 11.5, 7.0, 5.0),
  ('Protéines de soja texturées', 'legumineuses', 335, 50.0, 30.0, 1.5),
  ('Houmous', 'legumineuses', 275, 7.5, 14.0, 21.0),
  -- Légumes
  ('Brocoli', 'legumes', 30, 2.8, 4.0, 0.4),
  ('Haricots verts', 'legumes', 28, 1.8, 4.2, 0.2),
  ('Courgette', 'legumes', 18, 1.2, 2.3, 0.3),
  ('Épinards', 'legumes', 25, 2.9, 1.5, 0.4),
  ('Carotte', 'legumes', 36, 0.8, 7.5, 0.3),
  ('Tomate', 'legumes', 18, 0.9, 3.0, 0.2),
  ('Tomates cerises', 'legumes', 25, 1.0, 4.0, 0.3),
  ('Poivron rouge', 'legumes', 30, 0.9, 5.5, 0.3),
  ('Oignon', 'legumes', 40, 1.2, 7.5, 0.2),
  ('Ail', 'legumes', 135, 6.0, 27.0, 0.5),
  ('Champignons de Paris', 'legumes', 23, 3.0, 1.0, 0.3),
  ('Salade verte', 'legumes', 15, 1.2, 1.7, 0.3),
  ('Concombre', 'legumes', 13, 0.6, 2.2, 0.1),
  ('Chou-fleur', 'legumes', 26, 2.0, 3.0, 0.3),
  ('Aubergine', 'legumes', 22, 1.0, 3.5, 0.2),
  ('Petits pois', 'legumes', 80, 5.5, 11.5, 0.5),
  ('Poireau', 'legumes', 28, 1.5, 4.5, 0.3),
  ('Courge butternut', 'legumes', 38, 1.0, 8.0, 0.1),
  ('Chou kale', 'legumes', 45, 4.0, 5.0, 0.9),
  ('Avocat', 'legumes', 200, 1.8, 2.0, 20.0),
  ('Betterave cuite', 'legumes', 45, 1.7, 8.0, 0.1),
  ('Asperges', 'legumes', 22, 2.2, 2.5, 0.2),
  ('Chou rouge', 'legumes', 30, 1.4, 5.0, 0.2),
  ('Haricots mange-tout', 'legumes', 35, 2.8, 4.5, 0.2),
  ('Poêlée de légumes surgelée', 'legumes', 45, 2.0, 6.5, 0.5),
  -- Fruits
  ('Banane', 'fruits', 90, 1.1, 20.0, 0.3),
  ('Pomme', 'fruits', 53, 0.3, 12.0, 0.2),
  ('Poire', 'fruits', 55, 0.4, 12.5, 0.2),
  ('Orange', 'fruits', 47, 0.9, 9.0, 0.2),
  ('Clémentine', 'fruits', 45, 0.8, 9.5, 0.2),
  ('Kiwi', 'fruits', 58, 1.1, 11.0, 0.5),
  ('Fraises', 'fruits', 33, 0.7, 6.5, 0.3),
  ('Framboises', 'fruits', 45, 1.2, 6.5, 0.3),
  ('Myrtilles', 'fruits', 57, 0.7, 12.0, 0.3),
  ('Fruits rouges surgelés', 'fruits', 40, 1.0, 7.0, 0.3),
  ('Mangue', 'fruits', 65, 0.7, 14.0, 0.3),
  ('Ananas', 'fruits', 52, 0.5, 11.5, 0.2),
  ('Raisin', 'fruits', 70, 0.7, 16.0, 0.3),
  ('Compote sans sucres ajoutés', 'fruits', 60, 0.3, 13.5, 0.2),
  ('Dattes séchées', 'fruits', 285, 2.5, 66.0, 0.3),
  ('Abricots secs', 'fruits', 245, 3.4, 52.0, 0.5),
  ('Raisins secs', 'fruits', 305, 2.8, 70.0, 0.5),
  -- Oléagineux & graines
  ('Amandes', 'oleagineux', 610, 25.0, 7.5, 53.0),
  ('Noix', 'oleagineux', 690, 15.0, 7.0, 65.0),
  ('Noix de cajou', 'oleagineux', 600, 20.0, 27.0, 46.0),
  ('Noisettes', 'oleagineux', 660, 15.0, 7.0, 63.0),
  ('Pistaches', 'oleagineux', 590, 21.0, 18.0, 46.0),
  ('Cacahuètes grillées', 'oleagineux', 600, 25.0, 10.0, 50.0),
  ('Beurre de cacahuète', 'oleagineux', 610, 25.0, 13.0, 50.0),
  ('Purée d''amande complète', 'oleagineux', 630, 22.0, 6.0, 55.0),
  ('Graines de chia', 'oleagineux', 490, 17.0, 8.0, 31.0),
  ('Graines de lin', 'oleagineux', 500, 20.0, 2.0, 37.0),
  ('Graines de courge', 'oleagineux', 570, 30.0, 5.0, 47.0),
  ('Graines de tournesol', 'oleagineux', 595, 21.0, 13.0, 51.0),
  ('Noix de coco râpée', 'oleagineux', 660, 6.5, 7.0, 64.0),
  -- Matières grasses
  ('Huile d''olive', 'matieres_grasses', 900, 0, 0, 100),
  ('Huile de colza', 'matieres_grasses', 900, 0, 0, 100),
  ('Huile de tournesol', 'matieres_grasses', 900, 0, 0, 100),
  ('Huile de coco', 'matieres_grasses', 900, 0, 0, 100),
  ('Beurre doux', 'matieres_grasses', 745, 0.7, 0.8, 82.0),
  ('Beurre demi-sel', 'matieres_grasses', 730, 0.7, 0.8, 80.0),
  ('Mayonnaise', 'matieres_grasses', 690, 1.5, 1.5, 75.0),
  ('Margarine', 'matieres_grasses', 540, 0.2, 0.5, 60.0),
  -- Compléments sportifs
  ('Whey protéine (concentrée)', 'complements', 385, 78.0, 6.0, 5.5),
  ('Whey isolate', 'complements', 370, 88.0, 2.0, 1.0),
  ('Caséine micellaire', 'complements', 355, 80.0, 5.0, 1.5),
  ('Protéine végétale (pois)', 'complements', 380, 78.0, 4.0, 6.0),
  ('Barre protéinée', 'complements', 350, 33.0, 30.0, 10.0),
  ('Maltodextrine', 'complements', 380, 0, 95.0, 0),
  ('Gel énergétique', 'complements', 260, 0, 65.0, 0),
  ('Gainer (prise de masse)', 'complements', 380, 20.0, 70.0, 2.5),
  -- Épicerie & divers
  ('Miel', 'autres', 326, 0.4, 81.0, 0),
  ('Sucre', 'autres', 400, 0, 100.0, 0),
  ('Sirop d''érable', 'autres', 260, 0, 67.0, 0.1),
  ('Confiture', 'autres', 245, 0.4, 60.0, 0.1),
  ('Chocolat noir 70 %', 'autres', 570, 8.0, 33.0, 43.0),
  ('Cacao en poudre non sucré', 'autres', 360, 20.0, 15.0, 21.0),
  ('Coulis de tomate', 'autres', 35, 1.5, 6.0, 0.3),
  ('Sauce soja', 'autres', 60, 8.0, 5.5, 0.5),
  ('Pesto', 'autres', 450, 5.0, 5.0, 45.0),
  ('Lait de coco', 'autres', 180, 1.8, 3.0, 18.0),
  ('Moutarde', 'autres', 150, 7.0, 5.0, 11.0),
  ('Ketchup', 'autres', 110, 1.2, 25.0, 0.2),
  ('Boisson soja nature', 'autres', 39, 3.5, 1.0, 2.0),
  ('Boisson amande sans sucres', 'autres', 15, 0.5, 0.3, 1.2),
  ('Bouillon de légumes (préparé)', 'autres', 5, 0.3, 0.6, 0.1)
) as seed (name, category, kcal, protein, carbs, fat);

-- ===== 20261006120000_recipes.sql =====
-- Bloc 4 — Recettes : nom, nombre de portions, ingrédients en grammes.
-- Les macros ne sont pas stockées : elles sont calculées depuis les aliments (src/lib/calculations.ts).

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  servings integer not null check (servings between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_user_id_idx on public.recipes (user_id);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete restrict,
  grams numeric(7, 1) not null check (grams > 0 and grams <= 20000),
  position integer not null default 0
);

create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index recipe_ingredients_food_id_idx on public.recipe_ingredients (food_id);
create index recipe_ingredients_user_id_idx on public.recipe_ingredients (user_id);

alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;

create policy "recipes: lecture de ses recettes" on public.recipes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "recipes: création de ses recettes" on public.recipes
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "recipes: modification de ses recettes" on public.recipes
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "recipes: suppression de ses recettes" on public.recipes
  for delete to authenticated using (user_id = (select auth.uid()));

-- Un ingrédient appartient à l'utilisateur, à l'une de ses recettes, et pointe vers un aliment qu'il peut voir.
create policy "recipe_ingredients: lecture de ses ingrédients" on public.recipe_ingredients
  for select to authenticated using (user_id = (select auth.uid()));
create policy "recipe_ingredients: ajout dans ses recettes" on public.recipe_ingredients
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
    and exists (
      select 1 from public.foods f
      where f.id = food_id and (f.user_id is null or f.user_id = (select auth.uid()))
    )
  );
create policy "recipe_ingredients: modification de ses ingrédients" on public.recipe_ingredients
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
    and exists (
      select 1 from public.foods f
      where f.id = food_id and (f.user_id is null or f.user_id = (select auth.uid()))
    )
  );
create policy "recipe_ingredients: suppression de ses ingrédients" on public.recipe_ingredients
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.recipes, public.recipe_ingredients from anon;
grant select, insert, update, delete on table public.recipes, public.recipe_ingredients to authenticated;

-- Enregistre une recette et ses ingrédients en une seule transaction (création ou modification).
-- SECURITY INVOKER : les règles RLS de l'utilisateur s'appliquent à chaque requête.
-- p_ingredients : [{"food_id": "<uuid>", "grams": 120}, ...]
create function public.save_recipe(
  p_name text,
  p_servings integer,
  p_ingredients jsonb,
  p_recipe_id uuid default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_recipe_id uuid;
begin
  if p_recipe_id is null then
    insert into public.recipes (name, servings)
    values (p_name, p_servings)
    returning id into v_recipe_id;
  else
    update public.recipes
    set name = p_name, servings = p_servings, updated_at = now()
    where id = p_recipe_id
    returning id into v_recipe_id;

    if v_recipe_id is null then
      raise exception 'recipe_not_found' using errcode = 'P0002';
    end if;

    delete from public.recipe_ingredients where recipe_id = v_recipe_id;
  end if;

  insert into public.recipe_ingredients (recipe_id, food_id, grams, position)
  select v_recipe_id, (item ->> 'food_id')::uuid, (item ->> 'grams')::numeric, (ordinality - 1)::integer
  from jsonb_array_elements(p_ingredients) with ordinality as t (item, ordinality);

  return v_recipe_id;
end;
$$;

revoke execute on function public.save_recipe (text, integer, jsonb, uuid) from public, anon;
grant execute on function public.save_recipe (text, integer, jsonb, uuid) to authenticated;

-- ===== 20261006130000_stock.sql =====
-- Bloc 5 — Stock de plats préparés.
-- Une préparation = une recette cuisinée en N portions à une date donnée.
-- Le stock d'un plat = portions préparées − portions mangées (ajouté au bloc 7 avec le journal).

create table public.preparations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  portions integer not null check (portions between 1 and 100),
  prepared_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index preparations_user_id_idx on public.preparations (user_id);
create index preparations_recipe_id_idx on public.preparations (recipe_id);

alter table public.preparations enable row level security;

create policy "preparations: lecture de ses préparations" on public.preparations
  for select to authenticated using (user_id = (select auth.uid()));
create policy "preparations: ajout pour ses recettes" on public.preparations
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
  );
create policy "preparations: modification de ses préparations" on public.preparations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
  );
create policy "preparations: suppression de ses préparations" on public.preparations
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.preparations from anon;
grant select, insert, update, delete on table public.preparations to authenticated;

-- Rythme de batch cooking, utilisé par les recommandations du coach.
alter table public.profiles
  add column batches_per_week integer not null default 2 check (batches_per_week between 1 and 7),
  add column stock_portions_per_day numeric(3, 1) not null default 2
    check (stock_portions_per_day between 0.5 and 6);

-- Stock par recette. security_invoker : la vue applique les règles RLS de l'utilisateur.
create view public.recipe_stock with (security_invoker = true) as
select
  r.id as recipe_id,
  r.user_id,
  coalesce(p.produced, 0)::numeric as portions_left,
  p.last_prepared_on
from public.recipes r
left join (
  select recipe_id, sum(portions) as produced, max(prepared_on) as last_prepared_on
  from public.preparations
  group by recipe_id
) p on p.recipe_id = r.id;

revoke all on table public.recipe_stock from anon;
grant select on table public.recipe_stock to authenticated;

-- ===== 20261006140000_shopping.sql =====
-- Bloc 6 — Liste de courses.
-- shopping_plan_items : recettes et portions prévues pour le prochain batch.
-- shopping_checks : aliments cochés comme achetés.
-- La liste elle-même (grammes par aliment) est calculée par l'app (src/lib/calculations.ts).

create table public.shopping_plan_items (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  portions integer not null check (portions between 1 and 100),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create index shopping_plan_items_recipe_id_idx on public.shopping_plan_items (recipe_id);

create table public.shopping_checks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id uuid not null references public.foods (id) on delete cascade,
  checked_at timestamptz not null default now(),
  primary key (user_id, food_id)
);

create index shopping_checks_food_id_idx on public.shopping_checks (food_id);

alter table public.shopping_plan_items enable row level security;
alter table public.shopping_checks enable row level security;

create policy "shopping_plan_items: lecture de son plan" on public.shopping_plan_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "shopping_plan_items: ajout pour ses recettes" on public.shopping_plan_items
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
  );
create policy "shopping_plan_items: modification de son plan" on public.shopping_plan_items
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
  );
create policy "shopping_plan_items: suppression de son plan" on public.shopping_plan_items
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "shopping_checks: lecture de ses articles cochés" on public.shopping_checks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "shopping_checks: cocher un aliment visible" on public.shopping_checks
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.foods f
      where f.id = food_id and (f.user_id is null or f.user_id = (select auth.uid()))
    )
  );
create policy "shopping_checks: décocher ses articles" on public.shopping_checks
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.shopping_plan_items, public.shopping_checks from anon;
grant select, insert, update, delete on table public.shopping_plan_items to authenticated;
grant select, insert, delete on table public.shopping_checks to authenticated;

-- ===== 20261006150000_meal_journal.sql =====
-- Bloc 7 — Journal des repas.
-- source 'stock' : une portion piochée dans le stock (recipe_id renseigné, décrémente le stock).
-- source 'quick' : repas extérieur saisi rapidement (nom + kcal, macros facultatives).
-- Les valeurs nutritionnelles sont figées au moment du repas : modifier une recette ne réécrit pas l'historique.

create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eaten_on date not null,
  source text not null check (source in ('stock', 'quick')),
  recipe_id uuid references public.recipes (id) on delete set null,
  portions numeric(4, 2) not null default 1 check (portions > 0 and portions <= 10),
  name text not null check (char_length(name) between 1 and 120),
  kcal numeric(6, 1) not null check (kcal between 0 and 10000),
  protein_g numeric(5, 1) check (protein_g between 0 and 1000),
  carbs_g numeric(5, 1) check (carbs_g between 0 and 1000),
  fat_g numeric(5, 1) check (fat_g between 0 and 1000),
  created_at timestamptz not null default now()
);

create index meal_entries_user_day_idx on public.meal_entries (user_id, eaten_on);
create index meal_entries_recipe_id_idx on public.meal_entries (recipe_id);

alter table public.meal_entries enable row level security;

create policy "meal_entries: lecture de son journal" on public.meal_entries
  for select to authenticated using (user_id = (select auth.uid()));
create policy "meal_entries: ajout dans son journal" on public.meal_entries
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and (
      recipe_id is null
      or exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
    )
  );
create policy "meal_entries: modification de son journal" on public.meal_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      recipe_id is null
      or exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = (select auth.uid()))
    )
  );
create policy "meal_entries: suppression dans son journal" on public.meal_entries
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.meal_entries from anon;
grant select, insert, update, delete on table public.meal_entries to authenticated;

-- Le stock tient désormais compte des portions mangées.
-- Supprimer une entrée du journal remet automatiquement la portion en stock.
create or replace view public.recipe_stock with (security_invoker = true) as
select
  r.id as recipe_id,
  r.user_id,
  (coalesce(p.produced, 0) - coalesce(m.consumed, 0))::numeric as portions_left,
  p.last_prepared_on
from public.recipes r
left join (
  select recipe_id, sum(portions) as produced, max(prepared_on) as last_prepared_on
  from public.preparations
  group by recipe_id
) p on p.recipe_id = r.id
left join (
  select recipe_id, sum(portions) as consumed
  from public.meal_entries
  where source = 'stock' and recipe_id is not null
  group by recipe_id
) m on m.recipe_id = r.id;

-- ===== 20261006160000_activity.sql =====
-- Bloc 8 — Activité : pas du jour et séances de sport, saisis manuellement.

create table public.daily_steps (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  steps integer not null check (steps between 0 and 200000),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('strength', 'running', 'crossfit', 'other')),
  duration_min integer not null check (duration_min between 1 and 600),
  kcal integer not null check (kcal between 0 and 5000),
  created_at timestamptz not null default now()
);

create index workouts_user_day_idx on public.workouts (user_id, day);

alter table public.daily_steps enable row level security;
alter table public.workouts enable row level security;

create policy "daily_steps: lecture de ses pas" on public.daily_steps
  for select to authenticated using (user_id = (select auth.uid()));
create policy "daily_steps: ajout de ses pas" on public.daily_steps
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "daily_steps: modification de ses pas" on public.daily_steps
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "daily_steps: suppression de ses pas" on public.daily_steps
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "workouts: lecture de ses séances" on public.workouts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "workouts: ajout de ses séances" on public.workouts
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "workouts: modification de ses séances" on public.workouts
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "workouts: suppression de ses séances" on public.workouts
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.daily_steps, public.workouts from anon;
grant select, insert, update, delete on table public.daily_steps, public.workouts to authenticated;

-- ===== 20261006170000_weigh_ins.sql =====
-- Bloc 9 — Pesées. Une pesée par jour au maximum ; la plus récente devient le poids du profil
-- (et donc la base de calcul des cibles).

create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  weight_kg numeric(5, 1) not null check (weight_kg between 30 and 300),
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table public.weigh_ins enable row level security;

create policy "weigh_ins: lecture de ses pesées" on public.weigh_ins
  for select to authenticated using (user_id = (select auth.uid()));
create policy "weigh_ins: ajout de ses pesées" on public.weigh_ins
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "weigh_ins: modification de ses pesées" on public.weigh_ins
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "weigh_ins: suppression de ses pesées" on public.weigh_ins
  for delete to authenticated using (user_id = (select auth.uid()));

revoke all on table public.weigh_ins from anon;
grant select, insert, update, delete on table public.weigh_ins to authenticated;

-- Profils déjà créés : le poids de l'onboarding devient la première pesée.
insert into public.weigh_ins (user_id, day, weight_kg)
select user_id, created_at::date, weight_kg from public.profiles
on conflict (user_id, day) do nothing;

commit;
