-- Fix PUBLIC_DATA_EXPOSURE: Require authentication for help_requests access
-- Drop the overly permissive policy that allows anyone to view help requests
DROP POLICY IF EXISTS "Anyone can view open help requests" ON help_requests;

-- Create new policy requiring authentication to view help requests
CREATE POLICY "Authenticated users can view open help requests"
  ON help_requests FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND (status <> 'cancelled' OR requester_id = auth.uid())
  );