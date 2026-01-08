-- Create storage bucket for recipient images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipient-images', 'recipient-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recipient images (drop if exists first)
DROP POLICY IF EXISTS "Anyone can view recipient images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload recipient images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update recipient images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete recipient images" ON storage.objects;

CREATE POLICY "Anyone can view recipient images"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipient-images');

CREATE POLICY "Admins can upload recipient images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipient-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update recipient images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipient-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete recipient images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipient-images' 
  AND public.has_role(auth.uid(), 'admin')
);