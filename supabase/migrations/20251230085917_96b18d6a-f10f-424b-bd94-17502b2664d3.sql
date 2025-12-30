-- Create post_mentions table to store user tags in posts
CREATE TABLE public.post_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, mentioned_user_id)
);

-- Enable RLS
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;

-- Anyone can view mentions
CREATE POLICY "Anyone can view mentions" ON public.post_mentions 
FOR SELECT USING (true);

-- Post owners can add mentions
CREATE POLICY "Post owners can add mentions" ON public.post_mentions 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.feed_posts WHERE id = post_id AND user_id = auth.uid())
);

-- Post owners can delete mentions
CREATE POLICY "Post owners can delete mentions" ON public.post_mentions 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.feed_posts WHERE id = post_id AND user_id = auth.uid())
);

-- Create index for faster lookups
CREATE INDEX idx_post_mentions_post_id ON public.post_mentions(post_id);
CREATE INDEX idx_post_mentions_user_id ON public.post_mentions(mentioned_user_id);