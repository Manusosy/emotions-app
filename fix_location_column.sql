-- Simple SQL script to fix the location column issue
-- Run this in the Supabase SQL Editor

-- 1. Add the location column if it doesn't exist
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "location" TEXT;

-- 2. Ensure meta_data column exists (in case it wasn't added by previous script)
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT '{}'::jsonb;

-- 3. Update meta_data to include location values for fallback
UPDATE ambassador_profiles
SET meta_data = meta_data || jsonb_build_object('location', "location")
WHERE "location" IS NOT NULL;

-- 4. Call our schema cache refresh function if it exists
DO $$
BEGIN
  PERFORM refresh_schema_cache();
  RAISE NOTICE 'Schema cache refresh function called';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'No schema cache refresh function available';
END $$; 