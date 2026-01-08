-- Fix function search_path for update_recipient_stats
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix function search_path for generate_nft_token_id
CREATE OR REPLACE FUNCTION public.generate_nft_token_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.nft_token_id IS NULL THEN
    NEW.nft_token_id := 'CAMLY-RCP-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
    NEW.nft_minted_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can add donations" ON public.recipient_donations;
DROP POLICY IF EXISTS "Authenticated users can add assets" ON public.recipient_assets;
DROP POLICY IF EXISTS "Authenticated users can register as recipient" ON public.charity_recipients;

-- Create more secure policies for recipient_donations
CREATE POLICY "Donors can add their own donations"
ON public.recipient_donations FOR INSERT
WITH CHECK (auth.uid() = donor_id OR is_admin(auth.uid()));

-- Create more secure policies for recipient_assets  
CREATE POLICY "Donors can add assets they donated"
ON public.recipient_assets FOR INSERT
WITH CHECK (auth.uid() = donor_id OR is_admin(auth.uid()));

-- Create more secure policy for charity_recipients
CREATE POLICY "Users can register themselves as recipient"
ON public.charity_recipients FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));