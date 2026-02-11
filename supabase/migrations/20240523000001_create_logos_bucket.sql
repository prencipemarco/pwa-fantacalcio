-- Create a new storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Policy to allow public read access to the logos bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'logos' );

-- Policy to allow authenticated users to upload to the logos bucket
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'logos' );

-- Policy to allow users to update their own logos (optional, but good for overwrites)
CREATE POLICY "Authenticated Update" 
ON storage.objects FOR UPDATE
TO authenticated 
USING ( bucket_id = 'logos' );
