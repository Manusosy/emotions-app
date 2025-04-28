-- Simple SQL script to fix just the location column issue
-- Run this in the Supabase SQL Editor

-- Add the location column if it doesn't exist
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS "location" TEXT;

-- Set a placeholder meta_data value for all rows
UPDATE ambassador_profiles
SET meta_data = COALESCE(meta_data, '{}'::jsonb) || '{"location": ""}'::jsonb
WHERE meta_data->'location' IS NULL; 