-- Données de développement LOCAL uniquement (exécuté par `npx supabase db reset`).
-- N'est PAS inclus dans supabase/setup.sql et ne doit jamais être exécuté sur le projet distant.
--
-- Compte de test local, déjà confirmé :
--   e-mail       : test@nutrian.dev
--   mot de passe : NutrianLocal-2026
-- Pour tester l'inscription en local, utiliser une autre adresse (ex. signup-test@example.com).

do $$
declare
  test_user_id uuid := '00000000-0000-4000-8000-000000000001';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', test_user_id, 'authenticated', 'authenticated',
    'test@nutrian.dev', extensions.crypt('NutrianLocal-2026', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), test_user_id, test_user_id::text,
    jsonb_build_object('sub', test_user_id::text, 'email', 'test@nutrian.dev'),
    'email', now(), now(), now()
  );
end $$;
