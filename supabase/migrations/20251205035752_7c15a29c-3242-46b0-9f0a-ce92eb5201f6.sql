-- =============================================
-- DONATIONS SYSTEM
-- =============================================

-- Payment method enum
CREATE TYPE public.payment_method AS ENUM (
    'fiat_card',
    'fiat_bank_transfer',
    'crypto_eth',
    'crypto_btc',
    'crypto_usdt',
    'crypto_other'
);

-- Donation status enum
CREATE TYPE public.donation_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded'
);

-- Main donations table
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Amount
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'VND',
    amount_usd DECIMAL(15, 2), -- Converted to USD for stats
    
    -- Payment
    payment_method payment_method NOT NULL,
    status donation_status NOT NULL DEFAULT 'pending',
    
    -- Fiat payment info
    stripe_payment_id TEXT,
    stripe_receipt_url TEXT,
    
    -- Crypto payment info
    tx_hash TEXT,
    wallet_from TEXT,
    wallet_to TEXT,
    chain TEXT, -- ethereum, polygon, bsc
    block_number BIGINT,
    
    -- Metadata
    is_anonymous BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donation receipts
CREATE TABLE public.donation_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE UNIQUE,
    receipt_number TEXT NOT NULL UNIQUE,
    pdf_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_receipts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REPUTATION SYSTEM
-- =============================================

-- Badge type enum
CREATE TYPE public.badge_type AS ENUM (
    'donor_bronze',
    'donor_silver',
    'donor_gold',
    'donor_platinum',
    'donor_diamond',
    'volunteer_starter',
    'volunteer_active',
    'volunteer_hero',
    'first_donation',
    'recurring_donor',
    'campaign_creator',
    'verified_ngo',
    'community_helper',
    'early_adopter'
);

-- Badges definition table
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_type badge_type NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_vi TEXT NOT NULL,
    description TEXT,
    description_vi TEXT,
    icon_url TEXT,
    points_required INTEGER DEFAULT 0,
    is_nft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- User badges (earned badges)
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tx_hash TEXT, -- If minted as NFT
    UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Reputation events (tracking)
CREATE TABLE public.reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- donation, volunteer_checkin, campaign_funded, etc.
    points INTEGER NOT NULL,
    reference_id UUID, -- donation_id, campaign_id, etc.
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR DONATIONS
-- =============================================

-- Donors can view their own donations
CREATE POLICY "Donors can view own donations"
ON public.donations FOR SELECT
USING (auth.uid() = donor_id);

-- Campaign creators can view donations to their campaigns
CREATE POLICY "Campaign creators can view campaign donations"
ON public.donations FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND creator_id = auth.uid())
);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations"
ON public.donations FOR SELECT
USING (public.is_admin(auth.uid()));

-- Authenticated users can create donations
CREATE POLICY "Authenticated users can donate"
ON public.donations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (donor_id IS NULL OR auth.uid() = donor_id));

-- =============================================
-- RLS POLICIES FOR RECEIPTS
-- =============================================

CREATE POLICY "Users can view own receipts"
ON public.donation_receipts FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.donations WHERE id = donation_id AND donor_id = auth.uid())
);

CREATE POLICY "Admins can manage receipts"
ON public.donation_receipts FOR ALL
USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR BADGES
-- =============================================

CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges FOR ALL
USING (public.is_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR USER BADGES
-- =============================================

CREATE POLICY "Anyone can view user badges"
ON public.user_badges FOR SELECT
USING (true);

CREATE POLICY "System can award badges"
ON public.user_badges FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR REPUTATION EVENTS
-- =============================================

CREATE POLICY "Users can view own reputation"
ON public.reputation_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reputation events"
ON public.reputation_events FOR SELECT
USING (true);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_donations_donor ON public.donations(donor_id);
CREATE INDEX idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_created ON public.donations(created_at DESC);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_reputation_events_user ON public.reputation_events(user_id);

-- =============================================
-- FUNCTION: Update campaign raised_amount
-- =============================================

CREATE OR REPLACE FUNCTION public.update_campaign_raised_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        UPDATE public.campaigns
        SET raised_amount = raised_amount + NEW.amount
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_donation_completed
AFTER INSERT OR UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_campaign_raised_amount();

-- =============================================
-- FUNCTION: Award reputation points
-- =============================================

CREATE OR REPLACE FUNCTION public.award_reputation_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    points_to_award INTEGER;
BEGIN
    IF NEW.status = 'completed' AND NEW.donor_id IS NOT NULL THEN
        -- Calculate points (1 point per 10,000 VND or equivalent)
        points_to_award := GREATEST(1, FLOOR(NEW.amount / 10000));
        
        -- Insert reputation event
        INSERT INTO public.reputation_events (user_id, event_type, points, reference_id, reference_type)
        VALUES (NEW.donor_id, 'donation', points_to_award, NEW.id, 'donation');
        
        -- Update profile reputation score
        UPDATE public.profiles
        SET reputation_score = COALESCE(reputation_score, 0) + points_to_award
        WHERE user_id = NEW.donor_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_donation_award_points
AFTER INSERT OR UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.award_reputation_points();

-- =============================================
-- INSERT DEFAULT BADGES
-- =============================================

INSERT INTO public.badges (badge_type, name, name_vi, description, description_vi, points_required) VALUES
('first_donation', 'First Donation', 'Lần Đầu Quyên Góp', 'Made your first donation', 'Thực hiện quyên góp đầu tiên', 0),
('donor_bronze', 'Bronze Donor', 'Nhà Từ Thiện Đồng', 'Donated 100+ points worth', 'Quyên góp tương đương 100+ điểm', 100),
('donor_silver', 'Silver Donor', 'Nhà Từ Thiện Bạc', 'Donated 500+ points worth', 'Quyên góp tương đương 500+ điểm', 500),
('donor_gold', 'Gold Donor', 'Nhà Từ Thiện Vàng', 'Donated 1000+ points worth', 'Quyên góp tương đương 1000+ điểm', 1000),
('donor_platinum', 'Platinum Donor', 'Nhà Từ Thiện Bạch Kim', 'Donated 5000+ points worth', 'Quyên góp tương đương 5000+ điểm', 5000),
('donor_diamond', 'Diamond Donor', 'Nhà Từ Thiện Kim Cương', 'Donated 10000+ points worth', 'Quyên góp tương đương 10000+ điểm', 10000),
('recurring_donor', 'Recurring Donor', 'Nhà Quyên Góp Thường Xuyên', 'Set up recurring donations', 'Thiết lập quyên góp định kỳ', 0),
('campaign_creator', 'Campaign Creator', 'Người Tạo Chiến Dịch', 'Created an approved campaign', 'Tạo chiến dịch được phê duyệt', 0),
('verified_ngo', 'Verified NGO', 'Tổ Chức Đã Xác Minh', 'Verified non-profit organization', 'Tổ chức phi lợi nhuận đã xác minh', 0),
('early_adopter', 'Early Adopter', 'Người Dùng Tiên Phong', 'Joined during beta period', 'Tham gia trong giai đoạn beta', 0);