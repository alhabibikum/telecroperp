import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ERP_ALLOWED_ORIGIN') || 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const roles = [
  'Super Admin',
  'Owner',
  'General Manager',
  'Accounts Manager',
  'Sales Manager',
  'Warehouse Manager',
  'Salesman',
  'Cashier',
  'Accountant'
];

const respond = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' });

  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return respond(401, { error: 'Authentication required.' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Supabase Edge Function secrets are not configured.');
    return respond(500, { error: 'User management service is not configured.' });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return respond(401, { error: 'Invalid authentication session.' });

    const { data: actor, error: actorError } = await adminClient
      .from('app_users')
      .select('id,role,status')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();
    if (actorError) throw actorError;
    if (!actor || actor.status !== 'Active' || !['Super Admin', 'Owner', 'General Manager'].includes(actor.role)) {
      return respond(403, { error: 'You are not authorized to manage ERP users.' });
    }

    const body = await request.json();
    const action = body.action;
    const userInput = body.user || {};

    if (action === 'create') {
      const email = String(userInput.email || '').trim().toLowerCase();
      const password = String(userInput.password || '');
      const name = String(userInput.name || '').trim();
      const role = String(userInput.role || '');
      if (!email || !name || !roles.includes(role) || password.length < 6) {
        return respond(400, { error: 'Name, valid email, role and a password of at least 6 characters are required.' });
      }

      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (createError) return respond(400, { error: createError.message });

      const profile = {
        id: crypto.randomUUID(),
        auth_user_id: created.user.id,
        email,
        name,
        role,
        status: userInput.status === 'Suspended' ? 'Suspended' : 'Active',
        phone: String(userInput.phone || '').trim() || null,
        department: String(userInput.department || '').trim() || null,
        branch_name: String(userInput.branchName || '').trim() || null,
        avatar: String(userInput.avatar || '👨‍💼')
      };
      const { data: inserted, error: profileError } = await adminClient
        .from('app_users')
        .insert(profile)
        .select('id,email,name,role,status,phone,department,branch_name,avatar,created_at,last_login')
        .single();
      if (profileError) {
        await adminClient.auth.admin.deleteUser(created.user.id);
        throw profileError;
      }
      return respond(200, { user: inserted });
    }

    const id = String(body.id || '');
    if (!id) return respond(400, { error: 'User id is required.' });
    const { data: target, error: targetError } = await adminClient
      .from('app_users')
      .select('id,auth_user_id,email,name,role,status')
      .eq('id', id)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) return respond(404, { error: 'User account was not found.' });

    if (action === 'update') {
      const changes: Record<string, unknown> = {};
      for (const key of ['name', 'role', 'status', 'phone', 'department', 'avatar'] as const) {
        if (userInput[key] !== undefined) changes[key] = userInput[key];
      }
      if (userInput.branchName !== undefined) changes.branch_name = userInput.branchName;
      if (userInput.role !== undefined && !roles.includes(userInput.role)) {
        return respond(400, { error: 'Unknown role.' });
      }
      if (userInput.email !== undefined) {
        const email = String(userInput.email).trim().toLowerCase();
        if (!email) return respond(400, { error: 'Email is required.' });
        const { error } = await adminClient.auth.admin.updateUserById(target.auth_user_id, { email });
        if (error) return respond(400, { error: error.message });
        changes.email = email;
      }
      const { data: updated, error } = await adminClient
        .from('app_users')
        .update(changes)
        .eq('id', id)
        .select('id,email,name,role,status,phone,department,branch_name,avatar,created_at,last_login')
        .single();
      if (error) throw error;
      return respond(200, { user: updated });
    }

    if (action === 'toggle-status') {
      if (target.auth_user_id === authData.user.id) {
        return respond(400, { error: 'You cannot suspend your own account.' });
      }
      const status = target.status === 'Active' ? 'Suspended' : 'Active';
      const { data: updated, error } = await adminClient
        .from('app_users')
        .update({ status })
        .eq('id', id)
        .select('id,email,name,role,status,phone,department,branch_name,avatar,created_at,last_login')
        .single();
      if (error) throw error;
      return respond(200, { user: updated });
    }

    if (action === 'delete') {
      if (target.auth_user_id === authData.user.id) {
        return respond(400, { error: 'You cannot delete your own account.' });
      }
      const { error } = await adminClient.auth.admin.deleteUser(target.auth_user_id);
      if (error) throw error;
      return respond(200, { success: true });
    }

    if (action === 'reset-password') {
      const password = String(body.password || '');
      if (password.length < 6) {
        return respond(400, { error: 'Password must contain at least 6 characters.' });
      }
      const { error } = await adminClient.auth.admin.updateUserById(target.auth_user_id, { password });
      if (error) throw error;
      return respond(200, { success: true });
    }

    return respond(400, { error: 'Unknown user management action.' });
  } catch (error) {
    console.error('Admin user operation failed:', error);
    return respond(500, { error: 'User management operation failed.' });
  }
});
