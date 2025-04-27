-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('document', 'video', 'image', 'link')),
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    file_url TEXT,
    ambassador_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0
);

-- Enable RLS on resources table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create resources storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for resources table
-- Allow anyone to read resources
CREATE POLICY "Anyone can view resources"
    ON public.resources
    FOR SELECT
    USING (true);

-- Allow ambassadors to insert their own resources
CREATE POLICY "Ambassadors can insert their own resources"
    ON public.resources
    FOR INSERT
    WITH CHECK (
        auth.uid() = ambassador_id AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    );

-- Allow ambassadors to update their own resources
CREATE POLICY "Ambassadors can update their own resources"
    ON public.resources
    FOR UPDATE
    USING (
        auth.uid() = ambassador_id AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    );

-- Allow ambassadors to delete their own resources
CREATE POLICY "Ambassadors can delete their own resources"
    ON public.resources
    FOR DELETE
    USING (
        auth.uid() = ambassador_id AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    );

-- Create RLS policies for resources storage bucket
-- Allow anyone to read resources from storage
CREATE POLICY "Anyone can view resources from storage"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'resources');

-- Allow ambassadors to upload resources
CREATE POLICY "Ambassadors can upload resources"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'resources' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    );

-- Allow ambassadors to update their resources
CREATE POLICY "Ambassadors can update resources in storage"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'resources' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    );

-- Allow ambassadors to delete their resources
CREATE POLICY "Ambassadors can delete resources in storage"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'resources' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'ambassador'
        )
    ); 