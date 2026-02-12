-- Add image_url to press_statements
ALTER TABLE public.press_statements 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure RLS allows reading this column (covered by "SELECT USING (true)" usually)
