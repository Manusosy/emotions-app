import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekpiqiatfwozmepkgbbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y';

const supabase = createClient(supabaseUrl, supabaseKey);

const migrations = [
  `DROP TABLE IF EXISTS public.ambassador_reviews CASCADE;`,
  `DROP TABLE IF EXISTS public.ambassador_availability CASCADE;`,
  `DROP TABLE IF EXISTS public.mood_entries CASCADE;`,
  `DROP TABLE IF EXISTS public.appointments CASCADE;`,
  `DROP TABLE IF EXISTS public.support_groups CASCADE;`,
  `DROP TABLE IF EXISTS public.group_members CASCADE;`,
  `DROP TABLE IF EXISTS public.messages CASCADE;`,
  `DROP TABLE IF EXISTS public.profiles CASCADE;`,
  `DROP TABLE IF EXISTS public.patient_profiles CASCADE;`,
  `DROP TABLE IF EXISTS public.ambassador_profiles CASCADE;`,
  `DROP TABLE IF EXISTS public.users CASCADE;`,
  
  `CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('patient', 'ambassador', 'admin')) DEFAULT 'patient',
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
  );`,

  `CREATE TABLE public.patient_profiles (
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
  );`,

  `CREATE TABLE public.ambassador_profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT,
    bio TEXT,
    speciality TEXT,
    hourly_rate DECIMAL,
    availability_status TEXT DEFAULT 'available',
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
  );`,

  `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;`,

  `CREATE POLICY "Users can view their own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);`,

  `CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);`,

  `CREATE POLICY "Patients can view their own profile"
    ON public.patient_profiles
    FOR SELECT
    USING (auth.uid() = id);`,

  `CREATE POLICY "Patients can update their own profile"
    ON public.patient_profiles
    FOR UPDATE
    USING (auth.uid() = id);`,

  `CREATE POLICY "Anyone can view ambassador profiles"
    ON public.ambassador_profiles
    FOR SELECT
    USING (true);`,

  `CREATE POLICY "Ambassadors can update their own profile"
    ON public.ambassador_profiles
    FOR UPDATE
    USING (auth.uid() = id);`,

  `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
      INSERT INTO public.users (id, email, full_name, role)
      VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_metadata->>'full_name', NEW.email),
          COALESCE(NEW.raw_user_metadata->>'role', 'patient')
      );

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
              NEW.raw_user_metadata->>'full_name',
              NEW.email
          );
      END IF;

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();`
];

async function applyMigrations() {
  try {
    for (const sql of migrations) {
      console.log('Executing:', sql.slice(0, 50) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('Error executing SQL:', error);
        return;
      }
    }
    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

applyMigrations(); 