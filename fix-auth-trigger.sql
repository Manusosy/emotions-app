-- First, let's drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create a simplified function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  already_exists BOOLEAN;
BEGIN
  -- Check if user already exists in public.users to prevent duplicates
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = NEW.id
  ) INTO already_exists;
  
  -- Only insert if the user doesn't already exist
  IF NOT already_exists THEN
    -- Insert into users table with minimal required fields
    BEGIN
      INSERT INTO public.users (
        id, 
        email, 
        full_name,
        role
      ) VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(
          NEW.raw_user_meta_data->>'full_name',
          (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
          NEW.email
        ),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
      );
      
      -- Create role-specific profile if needed
      IF NEW.raw_user_meta_data->>'role' = 'ambassador' THEN
        INSERT INTO public.ambassador_profiles (id)
        VALUES (NEW.id);
      ELSE
        INSERT INTO public.patient_profiles (id)
        VALUES (NEW.id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log the error
      RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clear existing function for user updates
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;

-- Create a simplified user update function
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- Simply update basic information
  UPDATE public.users
  SET 
    full_name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      (NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'),
      users.full_name
    ),
    role = COALESCE(NEW.raw_user_meta_data->>'role', users.role),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  RAISE WARNING 'Error in handle_user_update: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create a function to log authentication events for debugging
CREATE OR REPLACE FUNCTION public.log_auth_event() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.auth_logs (
    event_type,
    user_id,
    email,
    created_at,
    metadata
  ) VALUES (
    TG_OP,
    NEW.id,
    NEW.email,
    CURRENT_TIMESTAMP,
    row_to_json(NEW.*)::JSONB
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Silently fail if the logging table doesn't exist
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create auth_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id SERIAL PRIMARY KEY,
    event_type TEXT,
    user_id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
); 