-- Remove hourly_rate column from ambassador_profiles
ALTER TABLE public.ambassador_profiles DROP COLUMN IF EXISTS hourly_rate;

-- Update existing profiles to ensure they are marked as free
UPDATE public.ambassador_profiles
SET availability_status = 'Available'
WHERE availability_status IS NULL OR availability_status = ''; 