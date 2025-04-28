-- Add missing columns to ambassador_profiles table

-- First, check if the ambassador_profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    bio TEXT,
    specialties TEXT[],
    languages TEXT[],
    education JSONB,
    experience JSONB,
    credentials TEXT,
    specialty TEXT,
    location TEXT,
    therapyTypes JSONB,
    services TEXT[],
    awards JSONB,
    availability_status TEXT,
    consultation_fee NUMERIC,
    isFree BOOLEAN,
    avatar_url TEXT,
    gallery_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't exist
DO $$
BEGIN
    -- Check and add awards column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'awards') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN awards JSONB;
    END IF;

    -- Check and add education column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'education') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN education JSONB;
    END IF;

    -- Check and add experience column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'experience') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN experience JSONB;
    END IF;

    -- Check and add therapyTypes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'therapyTypes') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN therapyTypes JSONB;
    END IF;

    -- Check and add gallery_images column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'gallery_images') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN gallery_images TEXT[];
    END IF;

    -- Check and add specialties column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'specialties') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN specialties TEXT[];
    END IF;

    -- Check and add languages column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'languages') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN languages TEXT[];
    END IF;

    -- Check and add services column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'ambassador_profiles'
                  AND column_name = 'services') THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN services TEXT[];
    END IF;
END $$;

-- Update handle_new_user function to create ambassador_profiles entries for ambassador role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF new.raw_user_metadata->>'role' = 'ambassador' THEN
        INSERT INTO public.ambassador_profiles (
            id, 
            full_name, 
            email, 
            phone_number,
            created_at,
            updated_at
        )
        VALUES (
            new.id, 
            COALESCE(new.raw_user_metadata->>'full_name', new.raw_user_metadata->>'firstName' || ' ' || new.raw_user_metadata->>'lastName'),
            new.email,
            new.raw_user_metadata->>'phone_number',
            NOW(),
            NOW()
        );
    ELSIF new.raw_user_metadata->>'role' = 'patient' THEN
        INSERT INTO public.patient_profiles (
            id, 
            first_name, 
            last_name
        )
        VALUES (
            new.id,
            new.raw_user_metadata->>'first_name' || COALESCE(new.raw_user_metadata->>'firstName', ''),
            new.raw_user_metadata->>'last_name' || COALESCE(new.raw_user_metadata->>'lastName', '')
        );
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on ambassador_profiles table
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for ambassador_profiles
-- Remove IF NOT EXISTS since PostgreSQL doesn't support it for policies
-- First, try to drop existing policies if they exist
DO $$
BEGIN
    -- Drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Users can view all ambassador profiles" ON public.ambassador_profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Ambassadors can update their own profile" ON public.ambassador_profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Ambassadors can insert their own profile" ON public.ambassador_profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
END $$;

-- Create policies without IF NOT EXISTS
CREATE POLICY "Users can view all ambassador profiles" 
    ON public.ambassador_profiles FOR SELECT
    USING (true);

CREATE POLICY "Ambassadors can update their own profile" 
    ON public.ambassador_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Ambassadors can insert their own profile" 
    ON public.ambassador_profiles FOR INSERT
    WITH CHECK (auth.uid() = id); 