-- This SQL script adds the isFree column to the ambassador_profiles table if it doesn't exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ambassador_profiles' 
    AND column_name = 'isFree'
  ) THEN
    ALTER TABLE ambassador_profiles ADD COLUMN isFree BOOLEAN DEFAULT true;
    RAISE NOTICE 'Column isFree added to ambassador_profiles table';
  ELSE
    RAISE NOTICE 'Column isFree already exists in ambassador_profiles table';
  END IF;
END $$; 