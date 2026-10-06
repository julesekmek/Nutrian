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
