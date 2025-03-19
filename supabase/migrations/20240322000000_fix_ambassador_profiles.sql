-- Add email column to ambassador_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.ambassador_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_metadata->>'full_name',
            CONCAT(
                COALESCE(NEW.raw_user_metadata->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_metadata->>'last_name', '')
            ),
            NEW.email
        ),
        COALESCE(NEW.raw_user_metadata->>'role', 'patient')
    );

    -- Create profile based on role
    IF NEW.raw_user_metadata->>'role' = 'patient' THEN
        INSERT INTO public.patient_profiles (
            id,
            first_name,
            last_name,
            email
        ) VALUES (
            NEW.id,
            NEW.raw_user_metadata->>'first_name',
            NEW.raw_user_metadata->>'last_name',
            NEW.email
        );
    ELSIF NEW.raw_user_metadata->>'role' = 'ambassador' THEN
        INSERT INTO public.ambassador_profiles (
            id,
            full_name,
            email
        ) VALUES (
            NEW.id,
            COALESCE(
                NEW.raw_user_metadata->>'full_name',
                CONCAT(
                    COALESCE(NEW.raw_user_metadata->>'first_name', ''),
                    ' ',
                    COALESCE(NEW.raw_user_metadata->>'last_name', '')
                )
            ),
            NEW.email
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role; 