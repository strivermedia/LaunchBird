-- Rename legacy client portal codes table (previously named client_profile_codes)
-- Safe for both existing and fresh databases.

DO $$
BEGIN
  IF to_regclass('public.client_profile_codes') IS NOT NULL
     AND to_regclass('public.client_portal_codes') IS NULL THEN
    ALTER TABLE public.client_profile_codes RENAME TO client_portal_codes;
  END IF;
END $$;

-- Ensure RLS stays enabled on the renamed/new table
ALTER TABLE IF EXISTS public.client_portal_codes ENABLE ROW LEVEL SECURITY;

