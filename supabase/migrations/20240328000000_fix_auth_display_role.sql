-- Migration to ensure user roles are properly shown in Supabase auth dashboard
-- This copies the role from public.users to auth.users raw_user_meta_data

-- First, update raw_user_meta_data for all users from the users table
UPDATE auth.users
SET raw_user_meta_data = 
    CASE 
        WHEN raw_user_meta_data IS NULL THEN 
            jsonb_build_object('role', u.role)
        ELSE 
            raw_user_meta_data || jsonb_build_object('role', u.role)
    END
FROM public.users u
WHERE auth.users.id = u.id 
AND u.role IS NOT NULL;

-- Special case for ambassador roles, ensure they're marked properly
UPDATE auth.users
SET raw_user_meta_data = 
    CASE 
        WHEN raw_user_meta_data IS NULL THEN 
            jsonb_build_object('role', 'ambassador')
        ELSE 
            raw_user_meta_data || jsonb_build_object('role', 'ambassador')
    END
FROM public.ambassador_profiles ap
WHERE auth.users.id = ap.id 
AND (auth.users.raw_user_meta_data->>'role' IS NULL OR auth.users.raw_user_meta_data->>'role' != 'ambassador');

-- Special case for patient roles, ensure they're marked properly
UPDATE auth.users
SET raw_user_meta_data = 
    CASE 
        WHEN raw_user_meta_data IS NULL THEN 
            jsonb_build_object('role', 'patient')
        ELSE 
            raw_user_meta_data || jsonb_build_object('role', 'patient')
    END
FROM public.patient_profiles pp
WHERE auth.users.id = pp.id 
AND (auth.users.raw_user_meta_data->>'role' IS NULL OR auth.users.raw_user_meta_data->>'role' != 'patient');

-- Ensure future user updates also update the role in raw_user_meta_data
CREATE OR REPLACE FUNCTION public.sync_user_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update auth.users metadata with the role
    UPDATE auth.users
    SET raw_user_meta_data = 
        CASE 
            WHEN raw_user_meta_data IS NULL THEN 
                jsonb_build_object('role', NEW.role)
            ELSE 
                raw_user_meta_data || jsonb_build_object('role', NEW.role)
        END
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_user_role_to_metadata_trigger ON public.users;

-- Create new trigger
CREATE TRIGGER sync_user_role_to_metadata_trigger
    AFTER UPDATE OF role ON public.users
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION public.sync_user_role_to_metadata(); 