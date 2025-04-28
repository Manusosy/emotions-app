-- Comprehensive column fix for ambassador_profiles table
-- Run this in the Supabase SQL Editor one statement at a time if you encounter errors

-- Add all potentially missing columns
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "full_name" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "email" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "phone_number" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "bio" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "specialty" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "speciality" TEXT; -- Alternative spelling

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "location" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "gender" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "availability_status" TEXT DEFAULT 'Available';

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "consultation_fee" NUMERIC DEFAULT 0;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "credentials" TEXT;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'ambassador';

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "profile_completion" INTEGER DEFAULT 0;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add JSON/array columns
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "specialties" TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "services" TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "gallery_images" TEXT[] DEFAULT '{}'::TEXT[];

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "education" JSONB DEFAULT '[]'::JSONB;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "experience" JSONB DEFAULT '[]'::JSONB;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "awards" JSONB DEFAULT '[]'::JSONB;

ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "therapyTypes" JSONB DEFAULT '[]'::JSONB;

-- Add meta_data column for fallback approach
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "meta_data" JSONB DEFAULT '{}'::jsonb;

-- Update meta_data with values from all columns for fallback
UPDATE ambassador_profiles
SET meta_data = meta_data || 
  jsonb_build_object(
    'full_name', full_name,
    'email', email,
    'phone_number', phone_number,
    'bio', bio,
    'specialty', specialty,
    'location', location,
    'gender', gender,
    'isFree', isFree,
    'consultation_fee', consultation_fee,
    'availability_status', availability_status
  );

-- Create a schema cache refresh function
CREATE OR REPLACE FUNCTION refresh_schema_cache() 
RETURNS void AS $$
BEGIN
  -- This is just a dummy function that forces clients to refresh schema cache
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run this statement separately if the DO block fails
-- Call the refresh function
DO $$
BEGIN
  PERFORM refresh_schema_cache();
EXCEPTION WHEN OTHERS THEN
  -- Swallow the error if function doesn't exist
END $$; 