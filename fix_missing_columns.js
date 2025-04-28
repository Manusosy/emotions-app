// Script to fix all the missing columns we've encountered
import { createClient } from '@supabase/supabase-js';
import * as process from 'process';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and service role key are required.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixMissingColumns() {
  try {
    console.log('Fixing missing columns in ambassador_profiles table...');

    // SQL to add all the missing columns we've found
    const sql = `
    -- Fix gender column
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = 'gender'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN gender TEXT;
            RAISE NOTICE 'Added gender column to ambassador_profiles table';
        ELSE
            RAISE NOTICE 'gender column already exists in ambassador_profiles table';
        END IF;
    END
    $$;

    -- Fix isFree column
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = 'isFree'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN "isFree" BOOLEAN DEFAULT true;
            RAISE NOTICE 'Added isFree column to ambassador_profiles table';
        ELSE
            RAISE NOTICE 'isFree column already exists in ambassador_profiles table';
        END IF;
    END
    $$;

    -- Fix awards column
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = 'awards'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN awards JSONB DEFAULT '[]'::jsonb;
            RAISE NOTICE 'Added awards column to ambassador_profiles table';
        ELSE
            RAISE NOTICE 'awards column already exists in ambassador_profiles table';
        END IF;
    END
    $$;

    -- Fix any other common columns that might be missing
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = 'specialties'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN specialties TEXT[] DEFAULT '{}'::text[];
            RAISE NOTICE 'Added specialties column to ambassador_profiles table';
        ELSE
            RAISE NOTICE 'specialties column already exists in ambassador_profiles table';
        END IF;
    END
    $$;
    
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = 'languages'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN languages TEXT[] DEFAULT '{}'::text[];
            RAISE NOTICE 'Added languages column to ambassador_profiles table';
        ELSE
            RAISE NOTICE 'languages column already exists in ambassador_profiles table';
        END IF;
    END
    $$;

    -- Force cache refresh
    COMMENT ON TABLE public.ambassador_profiles IS 'Ambassador profile information with fixed columns';
    `;

    console.log('Applying SQL to fix missing columns...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: sql
    });

    if (error) {
      console.error('Error fixing columns:', error);
      throw error;
    }

    console.log('✅ Fixed all missing columns successfully!');
    
    // Double check if the columns exist now
    console.log('Verifying columns were added...');
    const { data, error: verifyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'ambassador_profiles'
        AND column_name IN ('gender', 'isFree', 'awards', 'specialties', 'languages')
        ORDER BY column_name;
      `
    });

    if (verifyError) {
      console.error('Error verifying columns:', verifyError);
    } else {
      console.log('Columns verified in the database:');
      console.log(data);
    }

    console.log('You can now use the ambassador dashboard settings page without column errors.');
    console.log('If you still encounter issues, run the full fix script: node fix_all_ambassador_issues.js');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixMissingColumns(); 