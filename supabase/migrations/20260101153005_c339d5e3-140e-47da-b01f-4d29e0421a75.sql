-- Create live_comments table for real-time chat during livestreams
CREATE TABLE public.live_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  live_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_live_comments_live_id ON public.live_comments(live_id);
CREATE INDEX idx_live_comments_created_at ON public.live_comments(created_at DESC);

-- RLS Policies
-- Anyone can view comments
CREATE POLICY "Anyone can view live comments"
ON public.live_comments
FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.live_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.live_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for live_comments table
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_comments;