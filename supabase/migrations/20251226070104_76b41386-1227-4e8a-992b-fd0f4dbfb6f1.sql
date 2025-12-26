-- Fix RLS policies for call_sessions to match conversation membership logic (1-1 + groups)

-- Drop buggy/old policies (safe if they don't exist)
DROP POLICY IF EXISTS "Users can view calls in their conversations" ON public.call_sessions;
DROP POLICY IF EXISTS "Users can create calls in their conversations" ON public.call_sessions;
DROP POLICY IF EXISTS "Users can update calls in their conversations" ON public.call_sessions;

-- Recreate policies
CREATE POLICY "Users can view calls in their conversations"
ON public.call_sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = call_sessions.conversation_id
      AND (
        (
          NOT COALESCE(conversations.is_group, false)
          AND (
            conversations.participant1_id = auth.uid()
            OR conversations.participant2_id = auth.uid()
          )
        )
        OR (
          COALESCE(conversations.is_group, false)
          AND EXISTS (
            SELECT 1
            FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id
              AND cp.user_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "Users can create calls in their conversations"
ON public.call_sessions
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = call_sessions.conversation_id
      AND (
        (
          NOT COALESCE(conversations.is_group, false)
          AND (
            conversations.participant1_id = auth.uid()
            OR conversations.participant2_id = auth.uid()
          )
        )
        OR (
          COALESCE(conversations.is_group, false)
          AND EXISTS (
            SELECT 1
            FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id
              AND cp.user_id = auth.uid()
          )
        )
      )
  )
);

CREATE POLICY "Users can update calls in their conversations"
ON public.call_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = call_sessions.conversation_id
      AND (
        (
          NOT COALESCE(conversations.is_group, false)
          AND (
            conversations.participant1_id = auth.uid()
            OR conversations.participant2_id = auth.uid()
          )
        )
        OR (
          COALESCE(conversations.is_group, false)
          AND EXISTS (
            SELECT 1
            FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id
              AND cp.user_id = auth.uid()
          )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE conversations.id = call_sessions.conversation_id
      AND (
        (
          NOT COALESCE(conversations.is_group, false)
          AND (
            conversations.participant1_id = auth.uid()
            OR conversations.participant2_id = auth.uid()
          )
        )
        OR (
          COALESCE(conversations.is_group, false)
          AND EXISTS (
            SELECT 1
            FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversations.id
              AND cp.user_id = auth.uid()
          )
        )
      )
  )
);
