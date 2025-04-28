-- Fix for PostgreSQL policy creation syntax issues
-- PostgreSQL does not support IF NOT EXISTS for policy creation

-- Drop existing policies if they exist and recreate them properly
DO $$
BEGIN
    -- First try to drop any potentially problematic policies
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view ambassador profiles" ON public.ambassador_profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Ambassadors can update their own profile" ON public.ambassador_profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Public can view ambassador profiles" ON public.profiles;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Users can review ambassadors" ON public.ambassador_reviews;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Public can view ambassador reviews" ON public.ambassador_reviews;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;

    BEGIN
        DROP POLICY IF EXISTS "Ambassadors can manage their availability" ON public.ambassador_availability;
    EXCEPTION WHEN undefined_object THEN
        -- Policy doesn't exist, continue
    END;
END $$;

-- Recreate the needed policies (without IF NOT EXISTS)
-- Ambassador profiles policies
CREATE POLICY "Anyone can view ambassador profiles"
    ON public.ambassador_profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Ambassadors can update their own profile"
    ON public.ambassador_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Other policies if needed
-- Ambassador reviews policies
CREATE POLICY "Users can review ambassadors"
    ON public.ambassador_reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view ambassador reviews"
    ON public.ambassador_reviews
    FOR SELECT
    USING (true);

-- Make sure permissions are granted correctly
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.ambassador_profiles TO authenticated;
GRANT UPDATE ON public.ambassador_profiles TO authenticated; 