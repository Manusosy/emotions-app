-- Manual SQL script to create a function to fetch patient users
-- Run this in the Supabase SQL Editor if the automated script doesn't work

-- Create a function to retrieve patient users from auth.users
CREATE OR REPLACE FUNCTION public.get_patient_users()
RETURNS SETOF auth.users 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT * 
  FROM auth.users 
  WHERE 
    (raw_user_meta_data->>'role' = 'patient') OR
    (
      -- Check in users table as fallback
      id IN (
        SELECT id FROM public.users WHERE role = 'patient'
      )
    ) OR
    (
      -- Check if user has a patient profile
      id IN (
        SELECT id FROM public.patient_profiles
      )
    )
  ORDER BY created_at DESC;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.get_patient_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_patient_users() TO service_role; 