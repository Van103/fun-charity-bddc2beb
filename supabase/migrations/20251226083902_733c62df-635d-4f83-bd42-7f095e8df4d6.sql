-- Fix 1: Restrict access to full profiles to self/friends/admin
-- Remove overly-broad SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to view profiles of accepted friends
CREATE POLICY "Users can view friends' profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.friendships f
    WHERE f.status = 'accepted'
      AND (
        (f.user_id = auth.uid() AND f.friend_id = profiles.user_id)
        OR
        (f.friend_id = auth.uid() AND f.user_id = profiles.user_id)
      )
  )
);

-- Allow admins to view any profile
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Provide a safe, non-sensitive profile surface for general UI usage
-- (no wallet addresses or other sensitive linkage fields)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
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


-- Fix 2: Prevent campaign creators from de-anonymizing anonymous donations
-- Remove policy that exposes full donation rows to creators
DROP POLICY IF EXISTS "Campaign creators can view campaign donations" ON public.donations;

-- Create RPC that returns masked donation data to campaign creators
DROP FUNCTION IF EXISTS public.get_campaign_donations(uuid);
CREATE OR REPLACE FUNCTION public.get_campaign_donations(_campaign_id uuid)
RETURNS TABLE (
  id uuid,
  campaign_id uuid,
  donor_id uuid,
  amount numeric,
  amount_usd numeric,
  currency text,
  payment_method public.payment_method,
  status public.donation_status,
  is_anonymous boolean,
  is_recurring boolean,
  created_at timestamptz,
  completed_at timestamptz,
  message text,
  wallet_from text,
  wallet_to text,
  tx_hash text,
  block_number bigint,
  chain text,
  stripe_payment_id text,
  stripe_receipt_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.id,
    d.campaign_id,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.donor_id END AS donor_id,
    d.amount,
    d.amount_usd,
    d.currency,
    d.payment_method,
    d.status,
    COALESCE(d.is_anonymous, false) AS is_anonymous,
    COALESCE(d.is_recurring, false) AS is_recurring,
    d.created_at,
    d.completed_at,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.message END AS message,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.wallet_from END AS wallet_from,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.wallet_to END AS wallet_to,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.tx_hash END AS tx_hash,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.block_number END AS block_number,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.chain END AS chain,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.stripe_payment_id END AS stripe_payment_id,
    CASE WHEN COALESCE(d.is_anonymous, false) THEN NULL ELSE d.stripe_receipt_url END AS stripe_receipt_url
  FROM public.donations d
  JOIN public.campaigns c ON c.id = d.campaign_id
  WHERE d.campaign_id = _campaign_id
    AND (
      public.is_admin(auth.uid())
      OR c.creator_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.get_campaign_donations(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_campaign_donations(uuid) TO authenticated;