-- Fix the security definer view warning by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
SELECT
  id,
  user_id,
  full_name,
  avatar_url,
  cover_url,
  bio,
  role,
  is_verified,
  reputation_score,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;