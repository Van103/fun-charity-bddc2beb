-- Create storage bucket for live videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('live-videos', 'live-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for live-videos bucket
-- Anyone can view live videos (public)
CREATE POLICY "Live videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'live-videos');

-- Users can upload their own live videos
CREATE POLICY "Users can upload their own live videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'live-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own live videos
CREATE POLICY "Users can update their own live videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'live-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own live videos
CREATE POLICY "Users can delete their own live videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'live-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add is_live_video column to feed_posts to identify live stream posts
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS is_live_video boolean DEFAULT false;

-- Add live_viewer_count to store peak viewers during live
ALTER TABLE public.feed_posts 
ADD COLUMN IF NOT EXISTS live_viewer_count integer DEFAULT 0;