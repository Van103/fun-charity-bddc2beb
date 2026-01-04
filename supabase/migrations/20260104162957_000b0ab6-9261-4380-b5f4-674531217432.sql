-- Add moderation columns to feed_posts table
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_note text,
ADD COLUMN IF NOT EXISTS moderated_by uuid,
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone;

-- Create index for faster moderation queries
CREATE INDEX IF NOT EXISTS idx_feed_posts_moderation_status ON public.feed_posts(moderation_status);

-- Update existing posts to approved status (so current posts still show)
UPDATE public.feed_posts SET moderation_status = 'approved' WHERE moderation_status = 'pending';

-- Drop existing SELECT policies to recreate them
DROP POLICY IF EXISTS "Anyone can view feed posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Users can view approved posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.feed_posts;

-- Create new SELECT policies for moderation
CREATE POLICY "Users can view approved posts or own posts"
ON public.feed_posts
FOR SELECT
USING (
  moderation_status = 'approved' 
  OR user_id = auth.uid() 
  OR is_admin(auth.uid())
);

-- Allow admins to update moderation status
DROP POLICY IF EXISTS "Admins can update any post" ON public.feed_posts;
CREATE POLICY "Admins can update any post"
ON public.feed_posts
FOR UPDATE
USING (is_admin(auth.uid()));

-- Add notification type for moderation if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'post_approved' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'post_approved';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'post_rejected' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'post_rejected';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;