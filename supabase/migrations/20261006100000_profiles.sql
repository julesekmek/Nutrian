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
