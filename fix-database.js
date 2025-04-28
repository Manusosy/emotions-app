// Fix database script
// Run with "node fix-database.js"

// Import the necessary modules using ES module syntax
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key - use the same values as in your client.ts
const SUPABASE_URL = "https://ekpiqiatfwozmepkgbbe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL query to fix the profiles issue
const SQL_FIX = `
  -- Fix the profile tables issue
  DO $$
  BEGIN
      -- Check if the profiles table exists
      IF EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'profiles'
      ) THEN
          -- If it exists, drop the policy on it
          EXECUTE 'DROP POLICY IF EXISTS "Public can view ambassador profiles" ON public.profiles';
          
          -- Optionally, you can drop the table if it's no longer needed
          -- Uncomment the next line if you want to drop the table
          -- DROP TABLE IF EXISTS public.profiles CASCADE;
      END IF;
      
      -- Check if ambassador_profiles exists but needs the policy
      IF EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'ambassador_profiles'
      ) THEN
          -- Create policy for ambassador_profiles if it doesn't exist
          -- This ensures ambassador profiles can be viewed publicly
          IF NOT EXISTS (
              SELECT 1 
              FROM pg_policies 
              WHERE tablename = 'ambassador_profiles' 
              AND policyname = 'Anyone can view ambassador profiles'
          ) THEN
              CREATE POLICY "Anyone can view ambassador profiles"
                ON public.ambassador_profiles
                FOR SELECT
                USING (true);
          END IF;
      END IF;
  END
  $$;
`;

async function fixDatabase() {
  console.log("Running database fix script...");
  
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: SQL_FIX
    });
    
    if (error) {
      console.error("Error executing SQL fix:", error);
      process.exit(1);
    }
    
    console.log("Database fix completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Exception during database fix:", err);
    process.exit(1);
  }
}

// Run the fix
fixDatabase(); 