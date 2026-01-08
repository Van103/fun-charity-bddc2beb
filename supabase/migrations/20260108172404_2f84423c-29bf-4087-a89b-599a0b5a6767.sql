-- Create charity_recipients table for storing recipient information
CREATE TABLE public.charity_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  story TEXT,
  avatar_url TEXT,
  location TEXT,
  category TEXT DEFAULT 'other',
  nft_token_id TEXT UNIQUE,
  nft_minted_at TIMESTAMPTZ,
  wallet_address TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  total_received NUMERIC DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create recipient_donations table for donation history
CREATE TABLE public.recipient_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.charity_recipients(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES public.donations(id),
  donor_id UUID,
  donor_name TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'VND',
  asset_type TEXT DEFAULT 'money',
  asset_description TEXT,
  proof_media_urls JSONB DEFAULT '[]',
  tx_hash TEXT,
  message TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Create recipient_assets table for significant assets received
CREATE TABLE public.recipient_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.charity_recipients(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_value NUMERIC,
  currency TEXT DEFAULT 'VND',
  description TEXT,
  proof_url TEXT,
  donor_id UUID,
  donor_name TEXT,
  received_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charity_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipient_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for charity_recipients
CREATE POLICY "Anyone can view verified recipients"
ON public.charity_recipients FOR SELECT
USING (is_verified = true);

CREATE POLICY "Users can view their own recipient profile"
ON public.charity_recipients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recipients"
ON public.charity_recipients FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can register as recipient"
ON public.charity_recipients FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own recipient profile"
ON public.charity_recipients FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any recipient"
ON public.charity_recipients FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete recipients"
ON public.charity_recipients FOR DELETE
USING (is_admin(auth.uid()));

-- RLS Policies for recipient_donations
CREATE POLICY "Anyone can view recipient donations"
ON public.recipient_donations FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add donations"
ON public.recipient_donations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage donations"
ON public.recipient_donations FOR ALL
USING (is_admin(auth.uid()));

-- RLS Policies for recipient_assets
CREATE POLICY "Anyone can view recipient assets"
ON public.recipient_assets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can add assets"
ON public.recipient_assets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage assets"
ON public.recipient_assets FOR ALL
USING (is_admin(auth.uid()));

-- Function to update recipient stats when donation is added
CREATE OR REPLACE FUNCTION public.update_recipient_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.charity_recipients
  SET 
    total_received = total_received + NEW.amount,
    donation_count = donation_count + 1,
    updated_at = now()
  WHERE id = NEW.recipient_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating stats
CREATE TRIGGER on_recipient_donation_insert
AFTER INSERT ON public.recipient_donations
FOR EACH ROW
EXECUTE FUNCTION public.update_recipient_stats();

-- Function to generate NFT token ID
CREATE OR REPLACE FUNCTION public.generate_nft_token_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nft_token_id IS NULL THEN
    NEW.nft_token_id := 'CAMLY-RCP-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
    NEW.nft_minted_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate NFT token ID
CREATE TRIGGER generate_recipient_nft_id
BEFORE INSERT ON public.charity_recipients
FOR EACH ROW
EXECUTE FUNCTION public.generate_nft_token_id();

-- Enable realtime for recipient_donations
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipient_donations;