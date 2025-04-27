-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Ambassadors can view all patient profiles" ON public.patient_profiles;

-- Create a new policy that allows ambassadors to view all patient profiles
CREATE POLICY "Ambassadors can view all patient profiles"
    ON public.patient_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'ambassador'
        )
    );

-- Grant necessary permissions
GRANT SELECT ON public.patient_profiles TO authenticated; 