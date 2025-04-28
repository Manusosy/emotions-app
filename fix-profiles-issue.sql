-- Fix the profile tables issue
DO $$
BEGIN
    -- Check if the profiles table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- If it exists, drop the policy on it
        EXECUTE 'DROP POLICY IF EXISTS "Public can view ambassador profiles" ON public.profiles';
        
        -- Optionally, you can drop the table if it's no longer needed
        -- Uncomment the next line if you want to drop the table
        -- DROP TABLE IF EXISTS public.profiles CASCADE;
    END IF;
    
    -- Check if ambassador_profiles exists but needs the policy
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ambassador_profiles'
    ) THEN
        -- Create policy for ambassador_profiles if it doesn't exist
        -- This ensures ambassador profiles can be viewed publicly
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'ambassador_profiles' 
            AND policyname = 'Anyone can view ambassador profiles'
        ) THEN
            CREATE POLICY "Anyone can view ambassador profiles"
              ON public.ambassador_profiles
              FOR SELECT
              USING (true);
        END IF;
    END IF;
END
$$; 