-- Add image_url column to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url text;

-- Create user_presence table for online status
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY,
  is_online boolean DEFAULT false,
  last_seen timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_presence
CREATE POLICY "Anyone can view presence" ON public.user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update own presence" ON public.user_presence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presence" ON public.user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;