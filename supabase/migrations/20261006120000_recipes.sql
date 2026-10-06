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
