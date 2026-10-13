REVOKE ALL ON FUNCTION public.process_wholesale_sale(jsonb, text[])
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_wholesale_sale(jsonb, text[])
  TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.void_wholesale_sale(text, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.void_wholesale_sale(text, text, text)
  TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.rls_auto_enable()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at()
  FROM PUBLIC, anon, authenticated;
