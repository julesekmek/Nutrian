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
