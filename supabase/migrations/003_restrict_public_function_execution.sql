DO $$
DECLARE
  function_signature text;
  function_oid regprocedure;
BEGIN
  FOREACH function_signature IN ARRAY ARRAY[
    'public.process_wholesale_sale(jsonb,text[])',
    'public.void_wholesale_sale(text,text,text)',
    'public.rls_auto_enable()',
    'public.set_updated_at()'
  ]
  LOOP
    function_oid := to_regprocedure(function_signature);
    IF function_oid IS NOT NULL THEN
      EXECUTE format(
        'REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon',
        function_oid
      );
      IF function_signature IN (
        'public.process_wholesale_sale(jsonb,text[])',
        'public.void_wholesale_sale(text,text,text)'
      ) THEN
        EXECUTE format(
          'GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role',
          function_oid
        );
      ELSE
        EXECUTE format(
          'REVOKE ALL ON FUNCTION %s FROM authenticated',
          function_oid
        );
      END IF;
    END IF;
  END LOOP;
END
$$;
