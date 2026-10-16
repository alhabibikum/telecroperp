# Supabase Auth and RLS setup

The ERP does not include demo passwords. Supabase Auth is the only supported
login provider; keep the service-role key on an administrator's machine or in
Edge Function secrets and never put it in a `VITE_` variable. Removing a
credential from the current source does not remove it from Git history; rotate
any real password or provider key that was previously committed.

## New, empty Supabase project

1. Review `supabase_schema.sql` and run it once in the project's SQL Editor.
   This is a base-schema script, not a repeatable migration; do not run it over
   an existing ERP database.
2. Copy `.env.example` to `.env.local` and set the project URL, anon key, and
   service-role key. Set a unique bootstrap email, name, and password using
   `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_NAME`, and
   `BOOTSTRAP_ADMIN_PASSWORD`. For remote database CLI operations, also set
   `SUPABASE_DB_PASSWORD`; never use a `VITE_` prefix for it.
3. Create the first account:

   ```sh
   node scripts/create-bootstrap-admin.mjs --confirm-create-bootstrap-admin
   ```

   The script refuses to run if `app_users` already contains any profile. It
   creates a confirmed Supabase Auth user and links a `Super Admin` profile.
   Remove the bootstrap values from `.env.local` after setup.
4. Run `supabase/migrations/001_add_auth_user_link.sql`, then
   `supabase/migrations/002_enable_auth_and_rls.sql` and
   `supabase/migrations/003_restrict_public_function_execution.sql` in order.
   The first migration is safe to run after bootstrap; the second enables
   role-based RLS and grants authenticated access only through its policies.
   The third restricts direct execution of public RPC and trigger functions.
5. Set `ERP_ALLOWED_ORIGIN` and the Supabase URL, anon key, and service-role
   key as Supabase Edge Function secrets, then deploy the `admin-users`
   function. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the
   application deployment.

## Existing database with legacy password profiles

1. Back up the database and deploy the application only after reviewing this
   migration. Authenticate the CLI and link the project (`supabase login`,
   then `supabase link --project-ref <project-ref>`). Set
   `SUPABASE_DB_PASSWORD` in `.env.local` for remote database CLI operations.
   Run `001_add_auth_user_link.sql`.
2. Set the URL, anon key, service-role key, and
   `SUPABASE_PASSWORD_RESET_REDIRECT_URL` in `.env.local`. Allow the redirect
   URL in Supabase Auth settings.
3. Run `node scripts/migrate-auth-users.mjs
   --confirm-legacy-password-migration`. This is a one-time, resumable process:
   it transfers legacy passwords to Auth, links profiles, and requests resets
   for passwords shorter than Supabase's six-character minimum. Verify all
   users are linked and test sign-in/recovery before continuing.
4. Run `002_enable_auth_and_rls.sql`, then
   `003_restrict_public_function_execution.sql`. Deploy the Edge Function as
   described above, and remove the legacy password field/data from any backups
   or exports according to the organization's retention policy.

Do not run the base schema script against an existing database. Do not enable
the application before RLS is applied and an active Auth-linked Super Admin
exists. Business-table RLS currently authorizes access by module/role; review
cross-module reads and writes against the deployed role matrix before using
production data.
