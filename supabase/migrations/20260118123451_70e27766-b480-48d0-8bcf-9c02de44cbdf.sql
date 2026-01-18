-- Thêm cột email vào bảng profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Tạo function sync email từ auth.users sang profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET email = NEW.email 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Xóa trigger cũ nếu tồn tại
DROP TRIGGER IF EXISTS on_auth_user_created_sync_email ON auth.users;

-- Tạo trigger trên auth.users để sync email khi user đăng ký hoặc cập nhật
CREATE TRIGGER on_auth_user_created_sync_email
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();

-- Backfill email cho tất cả users hiện có
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id AND p.email IS NULL;