-- Simple SQL script to fix the isFree column issue
-- Run this in the Supabase SQL Editor

-- 1. Add the isFree column if it doesn't exist
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true;

-- 2. Set default values for any NULL entries
UPDATE ambassador_profiles 
SET "isFree" = true 
WHERE "isFree" IS NULL;

-- 3. Ensure meta_data column exists for fallback approach
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT '{}'::jsonb;

-- 4. Update meta_data to include isFree values
UPDATE ambassador_profiles
SET meta_data = COALESCE(meta_data, '{}'::jsonb) || jsonb_build_object('isFree', "isFree");

-- 5. Create a function to refresh schema cache (optional)
CREATE OR REPLACE FUNCTION refresh_schema_cache() 
RETURNS void AS $$
BEGIN
  -- Dummy function to force clients to refresh schema cache
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 