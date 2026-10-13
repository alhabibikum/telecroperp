import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

if (!process.argv.includes('--confirm-create-bootstrap-admin')) {
  throw new Error('Re-run with --confirm-create-bootstrap-admin after reviewing the setup steps.');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();

if (!supabaseUrl || !serviceRoleKey || !email || !password || !name) {
  throw new Error(
    'Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD and BOOTSTRAP_ADMIN_NAME in .env.local.'
  );
}
if (password.length < 6) {
  throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 6 characters.');
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { count, error: countError } = await adminClient
  .from('app_users')
  .select('id', { count: 'exact', head: true });
if (countError) throw countError;
if (count !== 0) {
  throw new Error('Bootstrap refused: app_users is not empty. Use the authenticated admin user-management flow.');
}

const { data: created, error: createError } = await adminClient.auth.admin.createUser({
  email,
  password,
  email_confirm: true
});
if (createError) throw createError;

const { error: profileError } = await adminClient.from('app_users').insert({
  id: randomUUID(),
  auth_user_id: created.user.id,
  email,
  name,
  role: 'Super Admin',
  status: 'Active'
});

if (profileError) {
  const { error: rollbackError } = await adminClient.auth.admin.deleteUser(created.user.id);
  if (rollbackError) {
    throw new Error(
      `Admin profile creation failed (${profileError.message}) and Auth rollback failed (${rollbackError.message}); remove the orphan Auth user ${created.user.id} manually.`
    );
  }
  throw profileError;
}

console.log(`Created the initial Super Admin account for ${email}.`);
