-- Create table for Angel AI conversations
CREATE TABLE public.angel_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Angel AI messages
CREATE TABLE public.angel_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.angel_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.angel_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angel_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for angel_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.angel_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.angel_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.angel_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.angel_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for angel_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.angel_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.angel_conversations
      WHERE id = angel_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.angel_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.angel_conversations
      WHERE id = angel_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_angel_conversations_user_id ON public.angel_conversations(user_id);
CREATE INDEX idx_angel_conversations_status ON public.angel_conversations(status);
CREATE INDEX idx_angel_messages_conversation_id ON public.angel_messages(conversation_id);
CREATE INDEX idx_angel_messages_created_at ON public.angel_messages(created_at);

-- Trigger for updating updated_at
CREATE TRIGGER update_angel_conversations_updated_at
  BEFORE UPDATE ON public.angel_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();