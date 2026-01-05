-- Add ai_model column to moderation_logs table
ALTER TABLE public.moderation_logs ADD COLUMN ai_model text;