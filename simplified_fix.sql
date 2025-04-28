-- Simplified SQL script to fix user roles in Supabase authentication dashboard
-- This only performs the updates without creating triggers

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