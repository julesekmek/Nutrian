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
