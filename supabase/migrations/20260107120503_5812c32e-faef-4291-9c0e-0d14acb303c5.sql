-- Cập nhật function reward_on_post để lấy reward amount từ config thay vì hardcode
CREATE OR REPLACE FUNCTION public.reward_on_post()
RETURNS TRIGGER AS $$
DECLARE
  v_reward_amount NUMERIC;
  v_today_earned NUMERIC;
  v_max_per_day NUMERIC;
  v_media_urls JSONB;
  v_action_type TEXT;
BEGIN
  -- Chỉ thưởng cho bài viết mới được duyệt
  IF NEW.moderation_status != 'approved' THEN
    RETURN NEW;
  END IF;

  -- Kiểm tra số tiền đã nhận hôm nay
  SELECT COALESCE(SUM(amount), 0) INTO v_today_earned
  FROM public.reward_transactions
  WHERE user_id = NEW.user_id 
    AND action_type IN ('post', 'post_text', 'post_image', 'post_video')
    AND currency = 'CAMLY'
    AND created_at >= CURRENT_DATE;

  -- Lấy giới hạn mỗi ngày (tổng của tất cả loại post)
  SELECT COALESCE(MAX(max_per_day), 100000) INTO v_max_per_day
  FROM public.reward_config
  WHERE action_type IN ('post_text', 'post_image', 'post_video') 
    AND reward_currency = 'CAMLY' 
    AND is_active = true;

  -- Nếu đã đạt giới hạn thì không thưởng thêm
  IF v_today_earned >= v_max_per_day THEN
    RETURN NEW;
  END IF;

  -- Xác định loại bài viết và lấy reward amount từ config
  v_media_urls := NEW.media_urls;
  
  IF v_media_urls IS NOT NULL AND jsonb_array_length(v_media_urls) > 0 THEN
    -- Kiểm tra có video không
    IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(v_media_urls) url WHERE url LIKE '%.mp4' OR url LIKE '%.webm' OR url LIKE '%.mov') THEN
      v_action_type := 'post_video';
    ELSE
      v_action_type := 'post_image';
    END IF;
  ELSE
    v_action_type := 'post_text';
  END IF;

  -- Lấy reward amount từ config
  SELECT reward_amount INTO v_reward_amount
  FROM public.reward_config
  WHERE action_type = v_action_type 
    AND reward_currency = 'CAMLY' 
    AND is_active = true
  LIMIT 1;

  -- Mặc định nếu không tìm thấy config
  IF v_reward_amount IS NULL THEN
    CASE v_action_type
      WHEN 'post_video' THEN v_reward_amount := 10000;
      WHEN 'post_image' THEN v_reward_amount := 8000;
      ELSE v_reward_amount := 5000;
    END CASE;
  END IF;

  -- Giới hạn không vượt quá max
  v_reward_amount := LEAST(v_reward_amount, v_max_per_day - v_today_earned);

  IF v_reward_amount > 0 THEN
    PERFORM public.award_user_reward(
      NEW.user_id,
      v_action_type,
      'CAMLY',
      v_reward_amount,
      NEW.id,
      'feed_post',
      CASE v_action_type
        WHEN 'post_video' THEN 'Thưởng đăng video'
        WHEN 'post_image' THEN 'Thưởng đăng ảnh'
        ELSE 'Thưởng đăng bài viết'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;