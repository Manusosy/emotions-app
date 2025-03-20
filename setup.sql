-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.ambassador_reviews CASCADE;
DROP TABLE IF EXISTS public.ambassador_availability CASCADE;
DROP TABLE IF EXISTS public.mood_entries CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.support_groups CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.patient_profiles CASCADE;
DROP TABLE IF EXISTS public.ambassador_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create the users table first since other tables reference it
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('patient', 'ambassador', 'admin')) DEFAULT 'patient',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  country TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ambassador profiles table
CREATE TABLE public.ambassador_profiles (
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Patients can view their own profile"
  ON public.patient_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Patients can update their own profile"
  ON public.patient_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view ambassador profiles"
  ON public.ambassador_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Ambassadors can update their own profile"
  ON public.ambassador_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user creation
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

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 