-- Function to ensure user roles are properly set
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user exists in public.users
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = NEW.id
    ) THEN
        -- Insert into public.users with the correct role
        INSERT INTO public.users (
            id,
            email,
            role,
            created_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_metadata->>'role', 'patient'),
            NOW()
        );
    END IF;

    -- If the user exists but role is not set correctly
    UPDATE public.users
    SET role = COALESCE(NEW.raw_user_metadata->>'role', role, 'patient')
    WHERE id = NEW.id AND (role IS NULL OR role = '');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_role_trigger ON auth.users;

-- Create new trigger
CREATE TRIGGER ensure_user_role_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_role();

-- Update existing users without roles
UPDATE public.users
SET role = 'ambassador'
WHERE id IN (
    SELECT id FROM public.ambassador_profiles
) AND (role IS NULL OR role = '' OR role = 'patient');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated; 