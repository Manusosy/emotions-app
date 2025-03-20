-- Ensure the ambassador_profiles table exists
CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  speciality TEXT,
  hourly_rate DECIMAL,
  availability_status TEXT DEFAULT 'available',
  phone_number TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

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
            )
        ),
        COALESCE(NEW.raw_user_metadata->>'role', 'patient')
    );

    -- Create profile based on role
    IF NEW.raw_user_metadata->>'role' = 'patient' THEN
        INSERT INTO public.patient_profiles (
            id,
            first_name,
            last_name,
            email,
            country
        ) VALUES (
            NEW.id,
            NEW.raw_user_metadata->>'first_name',
            NEW.raw_user_metadata->>'last_name',
            NEW.email,
            NEW.raw_user_metadata->>'country'
        );
    ELSIF NEW.raw_user_metadata->>'role' = 'ambassador' THEN
        INSERT INTO public.ambassador_profiles (
            id,
            full_name,
            email,
            availability_status
        ) VALUES (
            NEW.id,
            CONCAT(
                COALESCE(NEW.raw_user_metadata->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_metadata->>'last_name', '')
            ),
            NEW.email,
            'available'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on ambassador_profiles if not already enabled
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Anyone can view ambassador profiles" ON public.ambassador_profiles;
CREATE POLICY "Anyone can view ambassador profiles"
  ON public.ambassador_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Ambassadors can update their own profile" ON public.ambassador_profiles;
CREATE POLICY "Ambassadors can update their own profile"
  ON public.ambassador_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Grant minimal required permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.ambassador_profiles TO authenticated;
GRANT UPDATE ON public.ambassador_profiles TO authenticated; 