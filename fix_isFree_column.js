// Script to add isFree column to ambassador_profiles table
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // SQL to add isFree column if it doesn't exist
    const sql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'ambassador_profiles' 
          AND column_name = 'isFree'
        ) THEN
          ALTER TABLE ambassador_profiles ADD COLUMN isFree BOOLEAN DEFAULT true;
          RAISE NOTICE 'Column isFree added to ambassador_profiles table';
        ELSE
          RAISE NOTICE 'Column isFree already exists in ambassador_profiles table';
        END IF;
      END $$;
    `;

    console.log('Applying migration...');
    
    // Execute SQL directly
    const { error } = await supabase.rpc('pgadmin_executequery', { 
      query: sql
    });

    if (error) {
      console.error('Failed to apply migration using RPC:', error);
      console.log('Attempting to execute SQL directly...');
      
      const { error: sqlError } = await supabase.sql(sql);
      if (sqlError) {
        console.error('Failed to apply migration using direct SQL:', sqlError);
        console.log('Migration failed. Please run the following SQL manually in your Supabase SQL editor:');
        console.log(sql);
        process.exit(1);
      } else {
        console.log('Migration applied successfully using direct SQL.');
      }
    } else {
      console.log('Migration applied successfully using RPC.');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration(); 