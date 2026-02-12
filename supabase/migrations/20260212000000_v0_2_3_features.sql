-- Create app_settings table for global configuration (e.g., intro audio)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON public.app_settings
    FOR SELECT USING (true);

-- Allow write access only to authenticated users (admins) - simplistic for now
CREATE POLICY "Allow authenticated update" ON public.app_settings
    FOR UPDATE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Allow authenticated insert" ON public.app_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create press_statements table
CREATE TABLE IF NOT EXISTS public.press_statements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.press_statements ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow public read access" ON public.press_statements
    FOR SELECT USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow authenticated insert" ON public.press_statements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create generic storage bucket for app assets (if not exists logic is tricky in SQL, usually handle in UI or idempotent script)
-- For now, we assume the bucket 'logos' exists. We might need a new one 'app-assets'.
-- Attempting to insert into storage.buckets if permissions allow
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for app-assets (public read, auth write)
-- Policy for app-assets (public read, auth write)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'app-assets' );

DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'app-assets' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE
USING ( bucket_id = 'app-assets' AND auth.role() = 'authenticated' );
