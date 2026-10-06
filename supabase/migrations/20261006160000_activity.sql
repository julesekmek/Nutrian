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
