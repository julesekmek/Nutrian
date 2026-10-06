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
