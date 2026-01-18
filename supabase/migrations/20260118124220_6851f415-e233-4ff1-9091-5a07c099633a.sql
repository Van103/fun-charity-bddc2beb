-- Thêm cột is_blocked vào profiles để đánh dấu user bị chặn
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Thêm cột blocked_at để lưu thời gian chặn
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone;

-- Thêm cột blocked_reason để lưu lý do chặn
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS blocked_reason text;