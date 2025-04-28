-- Manual SQL script to create a function to fetch ambassador users
-- Run this in the Supabase SQL Editor if the automated script doesn't work

-- Create a function to retrieve ambassador users from auth.users
CREATE OR REPLACE FUNCTION public.get_ambassador_users()
RETURNS SETOF auth.users 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT * 
  FROM auth.users 
  WHERE 
    (raw_user_meta_data->>'role' = 'ambassador') OR
    (
      -- Check in users table as fallback
      id IN (
        SELECT id FROM public.users WHERE role = 'ambassador'
      )
    ) OR
    (
      -- Check if user has an ambassador profile
      id IN (
        SELECT id FROM public.ambassador_profiles
      )
    )
  ORDER BY created_at DESC;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.get_ambassador_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ambassador_users() TO service_role; 