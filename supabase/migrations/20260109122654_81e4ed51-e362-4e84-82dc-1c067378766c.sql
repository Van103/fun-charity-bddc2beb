-- Update handle_new_user_referral to use case-insensitive matching
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ref_code TEXT;
  referral_record RECORD;
  signup_reward_amount INTEGER := 50000; -- Reward for new user
  referrer_reward_amount INTEGER := 30000; -- Reward for referrer
BEGIN
  -- Lấy referral code từ user metadata
  ref_code := NEW.raw_user_meta_data->>'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Tìm referral code (case-insensitive matching)
    SELECT * INTO referral_record
    FROM referral_codes
    WHERE LOWER(TRIM(code)) = LOWER(TRIM(ref_code)) AND is_active = true;
    
    IF referral_record.id IS NOT NULL THEN
      -- Kiểm tra không tự refer chính mình
      IF referral_record.user_id != NEW.id THEN
        -- Ghi nhận sử dụng mã referral
        INSERT INTO referral_uses (referral_code_id, referred_user_id, reward_given)
        VALUES (referral_record.id, NEW.id, true)
        ON CONFLICT DO NOTHING;
        
        -- Cập nhật số lượt sử dụng và tổng earned của referrer
        UPDATE referral_codes
        SET uses_count = uses_count + 1,
            total_earned = total_earned + referrer_reward_amount,
            updated_at = now()
        WHERE id = referral_record.id;
        
        -- Tặng thưởng cho người được giới thiệu (new user)
        INSERT INTO user_balances (user_id, currency, balance, total_earned)
        VALUES (NEW.id, 'CAMLY', signup_reward_amount, signup_reward_amount)
        ON CONFLICT (user_id, currency) 
        DO UPDATE SET 
          balance = user_balances.balance + signup_reward_amount,
          total_earned = user_balances.total_earned + signup_reward_amount,
          updated_at = now();
        
        -- Ghi lịch sử giao dịch cho người được giới thiệu
        INSERT INTO reward_transactions (user_id, action_type, currency, amount, description, status, reference_type, reference_id)
        VALUES (NEW.id, 'referred', 'CAMLY', signup_reward_amount, 'Quà chào mừng - Đăng ký qua link giới thiệu', 'completed', 'referral', referral_record.id);
        
        -- Tặng thưởng cho người giới thiệu (referrer)
        INSERT INTO user_balances (user_id, currency, balance, total_earned)
        VALUES (referral_record.user_id, 'CAMLY', referrer_reward_amount, referrer_reward_amount)
        ON CONFLICT (user_id, currency) 
        DO UPDATE SET 
          balance = user_balances.balance + referrer_reward_amount,
          total_earned = user_balances.total_earned + referrer_reward_amount,
          updated_at = now();
        
        -- Ghi lịch sử giao dịch cho người giới thiệu
        INSERT INTO reward_transactions (user_id, action_type, currency, amount, description, status, reference_type, reference_id)
        VALUES (referral_record.user_id, 'referral', 'CAMLY', referrer_reward_amount, 'Phần thưởng giới thiệu bạn bè', 'completed', 'user', NEW.id::text);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;