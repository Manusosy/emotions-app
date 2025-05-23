-- Add missing 'awards' column to ambassador_profiles table
DO } 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'awards'
    ) THEN
        ALTER TABLE public.ambassador_profiles 
        ADD COLUMN awards JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added awards column to ambassador_profiles table';
    ELSE
        RAISE NOTICE 'awards column already exists in ambassador_profiles table';
    END IF;
END
};
