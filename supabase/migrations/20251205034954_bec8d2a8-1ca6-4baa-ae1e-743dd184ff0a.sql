-- =============================================
-- CAMPAIGNS SYSTEM
-- =============================================

-- Campaign status enum
CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'pending_review',
    'approved',
    'active',
    'paused',
    'completed',
    'rejected',
    'cancelled'
);

-- Campaign category enum
CREATE TYPE public.campaign_category AS ENUM (
    'education',
    'healthcare',
    'disaster_relief',
    'poverty',
    'environment',
    'animal_welfare',
    'community',
    'other'
);

-- Main campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    category campaign_category NOT NULL DEFAULT 'other',
    status campaign_status NOT NULL DEFAULT 'draft',
    
    -- Funding
    goal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    raised_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'VND',
    
    -- Media
    cover_image_url TEXT,
    video_url TEXT,
    
    -- Location
    location TEXT,
    region TEXT,
    
    -- Timing
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    urgency_level INTEGER DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5),
    
    -- Blockchain
    wallet_address TEXT,
    contract_address TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaign updates (progress posts)
CREATE TABLE public.campaign_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

-- Campaign media gallery
CREATE TABLE public.campaign_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image', -- image, video, document
    caption TEXT,
    is_proof BOOLEAN DEFAULT false, -- proof of use
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_media ENABLE ROW LEVEL SECURITY;

-- Campaign audit logs (for transparency)
CREATE TABLE public.campaign_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    auditor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    notes TEXT,
    previous_status campaign_status,
    new_status campaign_status,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_audits ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR CAMPAIGNS
-- =============================================

-- Anyone can view approved/active campaigns
CREATE POLICY "Public can view active campaigns"
ON public.campaigns FOR SELECT
USING (status IN ('approved', 'active', 'completed'));

-- Creators can view all their own campaigns
CREATE POLICY "Creators can view own campaigns"
ON public.campaigns FOR SELECT
USING (auth.uid() = creator_id);

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.campaigns FOR SELECT
USING (public.is_admin(auth.uid()));

-- Authenticated users can create campaigns
CREATE POLICY "Authenticated users can create campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own draft/pending campaigns
CREATE POLICY "Creators can update own campaigns"
ON public.campaigns FOR UPDATE
USING (auth.uid() = creator_id AND status IN ('draft', 'pending_review', 'rejected'));

-- Admins can update any campaign
CREATE POLICY "Admins can update any campaign"
ON public.campaigns FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Creators can delete their own draft campaigns
CREATE POLICY "Creators can delete own draft campaigns"
ON public.campaigns FOR DELETE
USING (auth.uid() = creator_id AND status = 'draft');

-- =============================================
-- RLS POLICIES FOR CAMPAIGN UPDATES
-- =============================================

CREATE POLICY "Anyone can view campaign updates"
ON public.campaign_updates FOR SELECT
USING (true);

CREATE POLICY "Campaign creators can add updates"
ON public.campaign_updates FOR INSERT
WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND creator_id = auth.uid())
);

CREATE POLICY "Authors can delete their updates"
ON public.campaign_updates FOR DELETE
USING (auth.uid() = author_id);

-- =============================================
-- RLS POLICIES FOR CAMPAIGN MEDIA
-- =============================================

CREATE POLICY "Anyone can view campaign media"
ON public.campaign_media FOR SELECT
USING (true);

CREATE POLICY "Campaign creators can add media"
ON public.campaign_media FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND creator_id = auth.uid())
);

CREATE POLICY "Campaign creators can delete media"
ON public.campaign_media FOR DELETE
USING (
    EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND creator_id = auth.uid())
);

-- =============================================
-- RLS POLICIES FOR CAMPAIGN AUDITS
-- =============================================

CREATE POLICY "Anyone can view audits for transparency"
ON public.campaign_audits FOR SELECT
USING (true);

CREATE POLICY "Only admins can create audits"
ON public.campaign_audits FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_category ON public.campaigns(category);
CREATE INDEX idx_campaigns_creator ON public.campaigns(creator_id);
CREATE INDEX idx_campaigns_featured ON public.campaigns(is_featured) WHERE is_featured = true;
CREATE INDEX idx_campaign_updates_campaign ON public.campaign_updates(campaign_id);
CREATE INDEX idx_campaign_media_campaign ON public.campaign_media(campaign_id);