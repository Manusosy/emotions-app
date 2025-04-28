-- Create function to sync role changes to raw_user_meta_data
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