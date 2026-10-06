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
