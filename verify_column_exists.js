// Script to directly verify if the isFree column exists in the database
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// The Supabase URL and key from your environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or key in environment variables');
  console.log('Please make sure VITE_SUPABASE_URL and either VITE_SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

async function verifyColumn() {
  try {
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking direct database for column existence...');
    
    // Using direct SQL query to check if column exists
    const { data, error } = await supabase.rpc('execute_sql', { 
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'ambassador_profiles'
        AND column_name = 'isFree'
      `
    });

    if (error) {
      console.error('Error executing SQL:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Success! The isFree column DOES exist in the database:');
      console.table(data);
      console.log('\nIf you are still seeing errors in your application, try:');
      console.log('1. Restart your application');
      console.log('2. Clear browser cache and local storage');
      console.log('3. Make sure the column name case matches exactly (isFree vs isfree)');
    } else {
      console.log('The isFree column DOES NOT exist in the database.');
      console.log('\nYou need to run the migration SQL:');
      console.log('ALTER TABLE ambassador_profiles ADD COLUMN isFree BOOLEAN DEFAULT true;');
    }
  } catch (error) {
    console.error('Unexpected error during column verification:', error);
  }
}

verifyColumn().catch(console.error); 