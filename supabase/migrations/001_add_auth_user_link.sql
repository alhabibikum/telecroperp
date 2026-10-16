-- Run against the existing database before running scripts/migrate-auth-users.mjs.
-- This migration is additive so legacy users and ERP records remain intact.
ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_users_auth_user_id_fkey'
      AND conrelid = 'public.app_users'::regclass
  ) THEN
    ALTER TABLE public.app_users
      ADD CONSTRAINT app_users_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS app_users_auth_user_id_uidx
  ON public.app_users(auth_user_id)
  WHERE auth_user_id IS NOT NULL;
