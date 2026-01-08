-- Create knowledge base table for Angel AI
CREATE TABLE public.angel_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'cosmic_father', 'camly', 'project', 'faq', 'general'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}', -- để tìm kiếm
  priority INTEGER DEFAULT 0, -- cao hơn = quan trọng hơn
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.angel_knowledge ENABLE ROW LEVEL SECURITY;

-- Everyone can read active knowledge (for Angel AI to use)
CREATE POLICY "Anyone can read active knowledge"
ON public.angel_knowledge
FOR SELECT
USING (is_active = true);

-- Only admins can manage knowledge
CREATE POLICY "Admins can manage knowledge"
ON public.angel_knowledge
FOR ALL
USING (public.is_admin(auth.uid()));

-- Add timestamp trigger
CREATE TRIGGER update_angel_knowledge_updated_at
BEFORE UPDATE ON public.angel_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial knowledge about the project
INSERT INTO public.angel_knowledge (category, title, content, keywords, priority) VALUES
('project', 'Giới thiệu FUN Charity', 
'FUN Charity là nền tảng từ thiện kết hợp công nghệ blockchain và mạng xã hội. Sứ mệnh của chúng tôi là kết nối những tấm lòng hảo tâm với những hoàn cảnh khó khăn, mang đến sự minh bạch và hiệu quả trong hoạt động từ thiện.',
ARRAY['fun', 'charity', 'từ thiện', 'giới thiệu', 'là gì'], 10),

('project', 'Tính năng chính',
'FUN Charity có các tính năng: 1) Quyên góp từ thiện với nhiều phương thức thanh toán, 2) Theo dõi chiến dịch minh bạch, 3) Mạng xã hội chia sẻ câu chuyện, 4) Hệ thống thiện nguyện viên, 5) Angel AI hỗ trợ 24/7, 6) Phần thưởng CAMLY coin cho người dùng tích cực.',
ARRAY['tính năng', 'feature', 'có gì', 'làm được gì'], 9),

('general', 'Đồng CAMLY',
'CAMLY là đồng xu nội bộ của FUN Charity. Người dùng nhận CAMLY khi đăng ký, đăng bài, quyên góp và tham gia hoạt động. CAMLY có thể dùng để mua quà tặng, tham gia sự kiện đặc biệt.',
ARRAY['camly', 'coin', 'xu', 'tiền', 'phần thưởng'], 8);