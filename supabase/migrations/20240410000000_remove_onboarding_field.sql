-- Remove the onboarding_completed field from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS onboarding_completed;

-- Add a comment explaining the change
COMMENT ON TABLE profiles IS 'Table containing profile information for users with onboarding process removed'; 