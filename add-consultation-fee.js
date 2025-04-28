// Add consultation_fee column to ambassador_profiles table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env file if available
dotenv.config();

// Use environment variables or default values for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function addConsultationFeeColumn() {
  console.log('Attempting to add consultation_fee column to ambassador_profiles table...');
  
  try {
    // Execute raw SQL to add the column
    const { data, error } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'ambassador_profiles' 
              AND column_name = 'consultation_fee'
            ) THEN
              ALTER TABLE public.ambassador_profiles 
              ADD COLUMN consultation_fee DECIMAL DEFAULT 0;
              RAISE NOTICE 'Added consultation_fee column to ambassador_profiles table';
            ELSE
              RAISE NOTICE 'consultation_fee column already exists in ambassador_profiles table';
            END IF;
          END
          $$;
        `
      }
    );
    
    if (error) {
      // Try alternative approach with direct SQL
      console.log('RPC failed, trying direct SQL approach...');
      
      const { error: directError } = await supabase
        .from('ambassador_profiles')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('Error querying ambassador_profiles table:', directError);
      } else {
        console.log('Successfully queried ambassador_profiles table, attempting to add column...');
        
        // Alternately, let's create the migration file and notify the user to apply it manually
        console.log('Please apply the migration file manually:');
        console.log(`
-- Add missing 'consultation_fee' column to ambassador_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'consultation_fee'
    ) THEN
        ALTER TABLE public.ambassador_profiles 
        ADD COLUMN consultation_fee DECIMAL DEFAULT 0;
        RAISE NOTICE 'Added consultation_fee column to ambassador_profiles table';
    ELSE
        RAISE NOTICE 'consultation_fee column already exists in ambassador_profiles table';
    END IF;
END
$$;
        `);
      }
    } else {
      console.log('SQL executed successfully via RPC!');
    }
    
    console.log('Operation completed.');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
addConsultationFeeColumn(); 