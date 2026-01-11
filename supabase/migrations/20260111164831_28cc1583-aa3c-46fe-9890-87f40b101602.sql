-- Add new columns to feed_comments for stickers and edit tracking
ALTER TABLE public.feed_comments 
ADD COLUMN IF NOT EXISTS sticker_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;

-- Create trigger to update updated_at on edit
CREATE OR REPLACE FUNCTION public.update_feed_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.is_edited = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_feed_comments_updated_at
BEFORE UPDATE ON public.feed_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_feed_comment_timestamp();

-- Add unique constraint to comment_reactions to prevent duplicate reactions
ALTER TABLE public.comment_reactions 
DROP CONSTRAINT IF EXISTS comment_reactions_user_comment_unique;

ALTER TABLE public.comment_reactions 
ADD CONSTRAINT comment_reactions_user_comment_unique UNIQUE (comment_id, user_id);

-- Add RLS policy for updating own comments
DROP POLICY IF EXISTS "Users can update their own comments" ON public.feed_comments;
CREATE POLICY "Users can update their own comments"
ON public.feed_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for comment_reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_reactions;