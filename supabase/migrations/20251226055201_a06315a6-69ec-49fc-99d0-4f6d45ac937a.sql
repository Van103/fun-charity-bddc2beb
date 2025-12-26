-- Drop old update policy that only allows updating own messages
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create new update policy that allows users to mark messages as read in their conversations
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      (NOT COALESCE(conversations.is_group, false) AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid()))
      OR (COALESCE(conversations.is_group, false) AND EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
      ))
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      (NOT COALESCE(conversations.is_group, false) AND (conversations.participant1_id = auth.uid() OR conversations.participant2_id = auth.uid()))
      OR (COALESCE(conversations.is_group, false) AND EXISTS (
        SELECT 1 FROM conversation_participants cp
        WHERE cp.conversation_id = conversations.id AND cp.user_id = auth.uid()
      ))
    )
  )
);