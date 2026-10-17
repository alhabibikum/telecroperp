import { randomBytes } from 'node:crypto';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

if (!process.argv.includes('--confirm-legacy-password-migration')) {
  throw new Error('Re-run with --confirm-legacy-password-migration after reviewing the migration steps.');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resetRedirectUrl = process.env.SUPABASE_PASSWORD_RESET_REDIRECT_URL;

if (!supabaseUrl || !anonKey || !serviceRoleKey || !resetRedirectUrl) {
  throw new Error(
    'Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_PASSWORD_RESET_REDIRECT_URL in .env.local.'
  );
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const publicClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { data: profiles, error: profilesError } = await adminClient
  .from('app_users')
  .select('id,email,password,auth_user_id,name,role,status,phone,department,branch_name,avatar');

if (profilesError) throw profilesError;

const { data: authPage, error: authError } = await adminClient.auth.admin.listUsers({
  page: 1,
  perPage: 1000
});
if (authError) throw authError;
if (authPage.users.length === 1000) {
  throw new Error('More than 1000 Auth users found; paginate/verify the account list before running this migration.');
}

const authById = new Map(authPage.users.map(user => [user.id, user]));
const authByEmail = new Map(
  authPage.users
    .filter(user => user.email)
    .map(user => [user.email.toLowerCase(), user])
);
const profileEmails = new Set();
const resetEmails = [];

for (const profile of profiles) {
  const email = profile.email?.trim().toLowerCase();
  const legacyPassword = profile.password;
  if (!email || !legacyPassword) {
    throw new Error(`Profile ${profile.id} has no email or legacy password; no more profiles were migrated.`);
  }
  if (profileEmails.has(email)) {
    throw new Error(`Multiple ERP profiles use the same email address (${email}); resolve the duplicate before migrating.`);
  }
  profileEmails.add(email);

  const linkedAuthUser = profile.auth_user_id
    ? authById.get(profile.auth_user_id)
    : authByEmail.get(email);
  if (
    linkedAuthUser?.email &&
    linkedAuthUser.email.trim().toLowerCase() !== email
  ) {
    throw new Error(`Profile ${profile.id} is linked to a different Auth email; resolve the mismatch before migrating.`);
  }
  if (linkedAuthUser?.user_metadata?.erp_legacy_password_migrated) {
    if (profile.auth_user_id !== linkedAuthUser.id) {
      const { error } = await adminClient
        .from('app_users')
        .update({ auth_user_id: linkedAuthUser.id })
        .eq('id', profile.id);
      if (error) throw error;
    }
    const resetRequired = linkedAuthUser.user_metadata.erp_legacy_password_reset_required === true ||
      (
        linkedAuthUser.user_metadata.erp_legacy_password_reset_required === undefined &&
        legacyPassword.length < 6
      );
    if (resetRequired) {
      resetEmails.push(email);
    }
    continue;
  }

  const needsReset = legacyPassword.length < 6;
  const authPassword = needsReset
    ? randomBytes(32).toString('base64url')
    : legacyPassword;
  const userMetadata = {
    ...(linkedAuthUser?.user_metadata || {}),
    erp_legacy_password_migrated: true,
    erp_legacy_password_reset_required: needsReset
  };

  let authUser;
  if (linkedAuthUser) {
    const { data, error } = await adminClient.auth.admin.updateUserById(linkedAuthUser.id, {
      password: authPassword,
      email_confirm: true,
      user_metadata: userMetadata
    });
    if (error) throw error;
    authUser = data.user;
  } else {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: authPassword,
      email_confirm: true,
      user_metadata: userMetadata
    });
    if (error) throw error;
    authUser = data.user;
  }

  const { error: linkError } = await adminClient
    .from('app_users')
    .update({ auth_user_id: authUser.id })
    .eq('id', profile.id);
  if (linkError) throw linkError;

  authById.set(authUser.id, authUser);
  authByEmail.set(email, authUser);
  if (needsReset) resetEmails.push(email);
}

for (const email of resetEmails) {
  const { error } = await publicClient.auth.resetPasswordForEmail(email, {
    redirectTo: resetRedirectUrl
  });
  if (error) {
    throw new Error(`Password reset email request failed for a legacy account (${email}): ${error.message}`);
  }

  const authUser = authByEmail.get(email);
  if (!authUser) {
    throw new Error(`Auth user lookup failed after requesting a password reset for ${email}.`);
  }
  const { error: metadataError } = await adminClient.auth.admin.updateUserById(authUser.id, {
    user_metadata: {
      ...authUser.user_metadata,
      erp_legacy_password_reset_required: false
    }
  });
  if (metadataError) throw metadataError;
}

console.log(`Linked ${profiles.length} ERP accounts to Supabase Auth.`);
console.log(`${resetEmails.length} short legacy passwords were replaced and reset emails were requested.`);
