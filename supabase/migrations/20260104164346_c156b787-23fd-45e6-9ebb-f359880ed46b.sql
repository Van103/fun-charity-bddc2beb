-- Create moderation_logs table to track blocked content
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'text', 'image', 'mixed'
  content TEXT, -- Text content that was blocked
  media_urls TEXT[], -- URLs of images/videos that were blocked
  reason TEXT NOT NULL, -- Why it was blocked
  categories TEXT[], -- ['nsfw', 'violence', 'hate_speech', 'spam']
  ai_score NUMERIC, -- Confidence score from AI (0-1)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Index for admin queries
CREATE INDEX idx_moderation_logs_user ON public.moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_date ON public.moderation_logs(created_at DESC);

-- RLS policies: Only admins can view moderation logs
CREATE POLICY "Admins can view all moderation logs"
ON public.moderation_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

-- System can insert logs (via service role in edge function)
CREATE POLICY "System can insert moderation logs"
ON public.moderation_logs
FOR INSERT
WITH CHECK (true);