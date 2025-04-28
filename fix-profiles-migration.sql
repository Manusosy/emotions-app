-- Fix the profile tables issue
DO $$
BEGIN
    -- Check if the profiles table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN
        -- If it exists, check if the policy exists before trying to drop it
        IF EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND policyname = 'Public can view ambassador profiles'
        ) THEN
            DROP POLICY "Public can view ambassador profiles" ON public.profiles;
        END IF;
    END IF;
    
    -- Check if ambassador_profiles exists but needs the policy
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'ambassador_profiles'
    ) THEN
        -- Create policy for ambassador_profiles if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'ambassador_profiles' 
            AND policyname = 'Anyone can view ambassador profiles'
        ) THEN
            -- Enable RLS if not already enabled
            ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;
            
            -- Create the policy
            CREATE POLICY "Anyone can view ambassador profiles"
              ON public.ambassador_profiles
              FOR SELECT
              USING (true);
        END IF;
    END IF;
END
$$; 