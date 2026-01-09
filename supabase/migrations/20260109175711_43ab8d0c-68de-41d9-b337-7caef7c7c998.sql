-- Fix WARN: RLS Policy Always True (overly permissive INSERT/UPDATE policies)

-- coin_purchases: disallow client-side UPDATEs (webhooks/service role bypass RLS)
DROP POLICY IF EXISTS "System can update purchases" ON public.coin_purchases;

-- moderation_logs: disallow client-side INSERTs (content-moderation function uses service role)
DROP POLICY IF EXISTS "System can insert moderation logs" ON public.moderation_logs;

-- volunteer_matches: disallow client-side INSERTs (volunteer-matching function uses service role)
DROP POLICY IF EXISTS "System can create matches" ON public.volunteer_matches;

-- notifications: replace always-true INSERT policy with authenticated-only INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);


-- Fix WARN: Function Search Path Mutable (set immutable search_path)

CREATE OR REPLACE FUNCTION public.generate_username_from_name(full_name text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  normalized TEXT;
  words TEXT[];
  result TEXT := '';
  word TEXT;
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN 'User';
  END IF;
  
  -- Bỏ dấu tiếng Việt bằng unaccent (nếu extension có sẵn) hoặc dùng translate
  normalized := translate(full_name, 
    'àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD'
  );
  
  -- Tách thành các từ
  words := regexp_split_to_array(trim(normalized), '\s+');
  
  -- Viết hoa chữ cái đầu mỗi từ và nối bằng dấu chấm
  FOREACH word IN ARRAY words
  LOOP
    IF word != '' THEN
      IF result != '' THEN
        result := result || '.';
      END IF;
      result := result || initcap(word);
    END IF;
  END LOOP;
  
  RETURN COALESCE(NULLIF(result, ''), 'User');
END;
$function$;


CREATE OR REPLACE FUNCTION public.generate_unique_referral_code(base_name text, exclude_id uuid DEFAULT NULL::uuid)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  test_code TEXT;
  counter INTEGER := 0;
  existing_count INTEGER;
BEGIN
  LOOP
    IF counter = 0 THEN
      test_code := base_name;
    ELSE
      test_code := base_name || counter::TEXT;
    END IF;
    
    -- Kiểm tra xem code đã tồn tại chưa (trừ record hiện tại nếu có)
    SELECT COUNT(*) INTO existing_count
    FROM referral_codes
    WHERE LOWER(code) = LOWER(test_code)
      AND (exclude_id IS NULL OR id != exclude_id);
    
    IF existing_count = 0 THEN
      RETURN test_code;
    END IF;
    
    counter := counter + 1;
    
    -- Giới hạn để tránh infinite loop
    IF counter > 1000 THEN
      RETURN base_name || '_' || gen_random_uuid()::TEXT;
    END IF;
  END LOOP;
END;
$function$;
