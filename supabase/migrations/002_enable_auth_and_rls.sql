-- Run only after scripts/migrate-auth-users.mjs has linked every app_users row.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.app_users WHERE auth_user_id IS NULL) THEN
    RAISE EXCEPTION 'Authentication migration incomplete: every app_users row must be linked to auth.users first';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.app_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
  SELECT role
  FROM public.app_users
  WHERE auth_user_id = auth.uid()
    AND status = 'Active'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.app_is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
  SELECT public.app_current_user_role() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.app_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
  SELECT COALESCE(
    public.app_current_user_role() IN ('Super Admin', 'Owner', 'General Manager'),
    false
  )
$$;

CREATE OR REPLACE FUNCTION public.app_user_has_permission(requested_view text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
SET row_security = off
AS $$
  SELECT CASE public.app_current_user_role()
    WHEN 'Super Admin' THEN true
    WHEN 'Owner' THEN true
    WHEN 'General Manager' THEN true
    WHEN 'Sales Manager' THEN requested_view = ANY(ARRAY[
      'dashboard', 'imei-trace', 'alert-center', 'wholesale-sales', 'retail-pos',
      'delivery-dispatch', 'inventory', 'purchases', 'accounting', 'due-ageing',
      'due-collection', 'sms-marketing', 'price-drop', 'brand-incentives',
      'emi-installment', 'phone-exchange', 'customers', 'salesmen', 'salesman-app',
      'field-visits', 'returns', 'reports', 'classic-reports',
      'dynamic-business-report', 'custom-reports'
    ])
    WHEN 'Salesman' THEN requested_view = ANY(ARRAY[
      'dashboard', 'salesman-app', 'field-visits', 'wholesale-sales',
      'due-collection', 'due-ageing', 'customers', 'imei-trace', 'alert-center'
    ])
    WHEN 'Warehouse Manager' THEN requested_view = ANY(ARRAY[
      'dashboard', 'inventory', 'imei-trace', 'barcode-labels', 'brands',
      'warehouses', 'stock-transfers', 'purchases', 'delivery-dispatch',
      'returns', 'warranty-service', 'phone-exchange', 'data-import', 'alert-center'
    ])
    WHEN 'Accounts Manager' THEN requested_view = ANY(ARRAY[
      'dashboard', 'cash-bank', 'bank-reconciliation', 'day-closing', 'expenses',
      'accounting', 'due-ageing', 'due-collection', 'wholesale-sales', 'purchases',
      'suppliers', 'customers', 'brand-incentives', 'price-drop', 'emi-installment',
      'reports', 'classic-reports', 'dynamic-business-report', 'custom-reports',
      'audit-logs', 'alert-center'
    ])
    WHEN 'Accountant' THEN requested_view = ANY(ARRAY[
      'dashboard', 'cash-bank', 'bank-reconciliation', 'day-closing', 'expenses',
      'accounting', 'due-ageing', 'due-collection', 'wholesale-sales', 'purchases',
      'suppliers', 'customers', 'reports', 'classic-reports',
      'dynamic-business-report', 'emi-installment', 'alert-center'
    ])
    WHEN 'Cashier' THEN requested_view = ANY(ARRAY[
      'dashboard', 'retail-pos', 'due-collection', 'phone-exchange', 'day-closing',
      'imei-trace', 'wholesale-sales', 'emi-installment', 'customers', 'alert-center',
      'cash-bank'
    ])
    ELSE false
  END
$$;

REVOKE ALL ON FUNCTION public.app_current_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.app_is_active_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.app_is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.app_user_has_permission(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.app_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_user_has_permission(text) TO authenticated;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS app_users_select_self_or_admin ON public.app_users;
CREATE POLICY app_users_select_self_or_admin ON public.app_users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.app_is_admin());
DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('system_settings', 'settings'),
      ('brands', 'brands'),
      ('warehouses', 'warehouses'),
      ('suppliers', 'suppliers'),
      ('customers', 'customers'),
      ('salesmen', 'salesmen'),
      ('products', 'inventory'),
      ('product_variants', 'inventory'),
      ('imeis', 'inventory'),
      ('purchase_invoices', 'purchases'),
      ('sales_invoices', 'wholesale-sales'),
      ('stock_transfers', 'stock-transfers'),
      ('customer_returns', 'returns'),
      ('supplier_returns', 'purchases'),
      ('money_receipts', 'due-collection'),
      ('emi_plans', 'emi-installment'),
      ('commission_disbursements', 'accounting'),
      ('bank_accounts', 'cash-bank'),
      ('bank_transactions', 'cash-bank'),
      ('bank_statements', 'bank-reconciliation'),
      ('cash_transactions', 'cash-bank'),
      ('expense_categories', 'expenses'),
      ('expenses', 'expenses'),
      ('day_closings', 'day-closing'),
      ('chart_of_accounts', 'accounting'),
      ('journal_entries', 'accounting'),
      ('warranty_claims', 'warranty-service'),
      ('brand_incentive_schemes', 'brand-incentives'),
      ('delivery_challans', 'delivery-dispatch'),
      ('price_drop_claims', 'price-drop'),
      ('phone_exchange_records', 'phone-exchange'),
      ('customer_follow_ups', 'customers'),
      ('salesman_visits', 'field-visits'),
      ('sms_logs', 'sms-marketing'),
      ('system_alerts', 'alert-center'),
      ('gateway_configs', 'api-integrations'),
      ('backup_snapshots', 'settings'),
      ('audit_logs', 'audit-logs')
    ) AS resources(table_name, view_name)
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.table_name);
    EXECUTE format('DROP POLICY IF EXISTS erp_role_access ON public.%I', item.table_name);
    EXECUTE format(
      'CREATE POLICY erp_role_access ON public.%I FOR ALL TO authenticated USING (public.app_user_has_permission(%L)) WITH CHECK (public.app_user_has_permission(%L))',
      item.table_name,
      item.view_name,
      item.view_name
    );
  END LOOP;
END
$$;

DROP POLICY IF EXISTS audit_logs_authenticated_insert ON public.audit_logs;
CREATE POLICY audit_logs_authenticated_insert ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.app_is_active_user());

DROP POLICY IF EXISTS system_alerts_authenticated_insert ON public.system_alerts;
CREATE POLICY system_alerts_authenticated_insert ON public.system_alerts
  FOR INSERT TO authenticated
  WITH CHECK (public.app_is_active_user());

ALTER TABLE public.app_users DROP COLUMN IF EXISTS password;
