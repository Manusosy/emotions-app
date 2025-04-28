-- Add missing INSERT policy for ambassador_profiles
-- This is needed to allow ambassadors to insert their profile

-- First drop if it exists (just to be safe)
DROP POLICY IF EXISTS "Ambassadors can insert their own profile" ON public.ambassador_profiles;

-- Create the INSERT policy
CREATE POLICY "Ambassadors can insert their own profile"
  ON public.ambassador_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Log that this migration has been applied
DO $$
BEGIN
  RAISE NOTICE 'Added INSERT policy for ambassador_profiles';
END $$; 