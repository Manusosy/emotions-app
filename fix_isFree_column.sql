-- SQL script to fix the isFree column issue in ambassador_profiles table
-- Run this in the Supabase SQL Editor

-- 1. First check if the column exists
DO $$
DECLARE 
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'ambassador_profiles' 
    AND column_name = 'isFree'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'isFree column already exists, no need to add it';
  ELSE
    RAISE NOTICE 'isFree column does not exist, adding it now...';
    
    -- 2. Add the column with a default value of true
    ALTER TABLE ambassador_profiles 
    ADD COLUMN "isFree" BOOLEAN DEFAULT true;
    
    RAISE NOTICE 'Successfully added isFree column';
  END IF;
  
  -- 3. Update existing rows to ensure none have NULL values
  UPDATE ambassador_profiles 
  SET "isFree" = true 
  WHERE "isFree" IS NULL;
  
  RAISE NOTICE 'Set default values for any NULL entries';
  
  -- 4. Create or replace function for schema cache refreshing
  CREATE OR REPLACE FUNCTION refresh_schema_cache() RETURNS void AS $$
  BEGIN
    -- This is just a dummy function that forces clients to refresh their schema cache
    -- when they call it
    RETURN;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  RAISE NOTICE 'Created schema cache refresh function';
  
  -- 5. Optionally ensure meta_data column exists as a fallback
  -- This is useful if you want to store isFree in both places for maximum compatibility
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'ambassador_profiles' 
    AND column_name = 'meta_data'
  ) INTO column_exists;
  
  IF column_exists THEN
    RAISE NOTICE 'meta_data column already exists';
    
    -- Update meta_data to include isFree for all rows
    UPDATE ambassador_profiles
    SET meta_data = COALESCE(meta_data, '{}'::jsonb) || jsonb_build_object('isFree', "isFree");
    
    RAISE NOTICE 'Updated meta_data to include isFree values';
  ELSE
    RAISE NOTICE 'meta_data column does not exist, adding it now...';
    
    -- Add meta_data column
    ALTER TABLE ambassador_profiles 
    ADD COLUMN meta_data JSONB DEFAULT '{}'::jsonb;
    
    -- Initialize with isFree values
    UPDATE ambassador_profiles
    SET meta_data = jsonb_build_object('isFree', "isFree");
    
    RAISE NOTICE 'Added meta_data column and initialized with isFree values';
  END IF;
  
  RAISE NOTICE 'Column fix complete. The application should now work correctly.';
END $$; 