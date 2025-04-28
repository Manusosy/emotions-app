// This script will print the SQL needed to add the isFree column to the ambassador_profiles table
console.log('Run this SQL in your Supabase SQL editor:');
console.log(`
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
`);
console.log('\nAfter executing this SQL, your ambassador_profiles table will have an isFree column with a default value of true.'); 