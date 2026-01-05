-- Create function to claim rewards (move claimable to claimed)
CREATE OR REPLACE FUNCTION public.claim_rewards(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_claimable_amount NUMERIC;
  v_result jsonb;
BEGIN
  -- Get current claimable balance
  SELECT COALESCE(balance, 0) INTO v_claimable_amount
  FROM public.user_balances
  WHERE user_id = p_user_id AND currency = 'CAMLY';

  IF v_claimable_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Không có xu nào để nhận',
      'claimed_amount', 0
    );
  END IF;

  -- Update balance: move to claimed (total_withdrawn tracks claimed)
  UPDATE public.user_balances
  SET 
    balance = 0,
    total_withdrawn = total_withdrawn + v_claimable_amount,
    updated_at = now()
  WHERE user_id = p_user_id AND currency = 'CAMLY';

  -- Log the claim transaction
  INSERT INTO public.reward_transactions (
    user_id, action_type, currency, amount, description, status
  ) VALUES (
    p_user_id, 'claim', 'CAMLY', v_claimable_amount, 'Nhận phần thưởng về tài khoản', 'completed'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Đã nhận thành công!',
    'claimed_amount', v_claimable_amount
  );
END;
$$;

-- Add posts ranking leaderboard table for caching
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  extra_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(leaderboard_type, user_id)
);

-- Enable RLS
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Policy for viewing leaderboard (public)
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard_cache FOR SELECT
USING (true);

-- Create milestone_achievements table
CREATE TABLE IF NOT EXISTS public.milestone_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, milestone_type, milestone_value)
);

-- Enable RLS
ALTER TABLE public.milestone_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own milestones
CREATE POLICY "Users can view own milestones"
ON public.milestone_achievements FOR SELECT
USING (auth.uid() = user_id);

-- System can insert milestones
CREATE POLICY "System can insert milestones"
ON public.milestone_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check and award milestones
CREATE OR REPLACE FUNCTION public.check_milestones(p_user_id uuid)
RETURNS TABLE(milestone_type TEXT, milestone_value INTEGER, is_new BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_posts_count INTEGER;
  v_friends_count INTEGER;
  v_total_camly NUMERIC;
  v_milestone_values INTEGER[] := ARRAY[10, 50, 100, 500, 1000, 5000, 10000];
  v_coin_milestones INTEGER[] := ARRAY[10000, 100000, 500000, 1000000, 5000000, 10000000];
  v_val INTEGER;
BEGIN
  -- Count posts
  SELECT COUNT(*) INTO v_posts_count
  FROM public.feed_posts
  WHERE feed_posts.user_id = p_user_id AND moderation_status = 'approved';

  -- Count friends
  SELECT COUNT(*) INTO v_friends_count
  FROM public.friendships
  WHERE (friendships.user_id = p_user_id OR friend_id = p_user_id) AND status = 'accepted';

  -- Get total Camly earned
  SELECT COALESCE(total_earned, 0) INTO v_total_camly
  FROM public.user_balances
  WHERE user_balances.user_id = p_user_id AND currency = 'CAMLY';

  -- Check posts milestones
  FOREACH v_val IN ARRAY v_milestone_values LOOP
    IF v_posts_count >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'posts', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'posts';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  -- Check friends milestones
  FOREACH v_val IN ARRAY v_milestone_values LOOP
    IF v_friends_count >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'friends', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'friends';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  -- Check coin milestones
  FOREACH v_val IN ARRAY v_coin_milestones LOOP
    IF v_total_camly >= v_val THEN
      INSERT INTO public.milestone_achievements (user_id, milestone_type, milestone_value)
      VALUES (p_user_id, 'coins', v_val)
      ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING;
      
      IF FOUND THEN
        milestone_type := 'coins';
        milestone_value := v_val;
        is_new := true;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;

  RETURN;
END;
$$;