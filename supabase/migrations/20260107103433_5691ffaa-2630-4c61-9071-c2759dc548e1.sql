-- Create blockchain_claims table for tracking token claims
CREATE TABLE IF NOT EXISTS public.blockchain_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  points_claimed NUMERIC NOT NULL,
  tokens_minted NUMERIC NOT NULL,
  tx_hash TEXT,
  chain TEXT DEFAULT 'polygon',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  signature TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.blockchain_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view own claims" ON public.blockchain_claims
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own claims
CREATE POLICY "Users can create own claims" ON public.blockchain_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all claims using is_admin function
CREATE POLICY "Admins can view all claims" ON public.blockchain_claims
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update claims
CREATE POLICY "Admins can update claims" ON public.blockchain_claims
  FOR UPDATE USING (is_admin(auth.uid()));

-- Add token tracking columns to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_tokens_claimed NUMERIC DEFAULT 0;

-- Add extra columns to reward_config if not exists
ALTER TABLE public.reward_config
ADD COLUMN IF NOT EXISTS token_conversion_rate NUMERIC DEFAULT 100,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS display_name_vi TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blockchain_claims_user_id ON public.blockchain_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_claims_status ON public.blockchain_claims(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_claims_created_at ON public.blockchain_claims(created_at DESC);

-- Enable realtime for blockchain_claims
ALTER PUBLICATION supabase_realtime ADD TABLE public.blockchain_claims;