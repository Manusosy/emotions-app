// Simple script to diagnose and fix isFree column issue in ambassador_profiles table
// Usage: node fix_isFree_issue.js <supabase-url> <supabase-key>

import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node fix_isFree_issue.js <supabase-url> <supabase-key>');
  process.exit(1);
}

const supabaseUrl = args[0];
const supabaseKey = args[1];

async function diagnoseAndFix() {
  console.log('Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Attempt 1: Try to explicitly create the column if it doesn't exist
  console.log('\n--- Step 1: Verify if the column exists ---');
  try {
    const { data: columnExists, error: checkError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'isFree'
      `
    });
    
    if (checkError) {
      console.error('Error checking column existence:', checkError.message);
    } else {
      if (columnExists && columnExists.length > 0) {
        console.log('✅ The isFree column exists in the database');
      } else {
        console.log('❌ The isFree column does NOT exist in the database');
        
        console.log('\n--- Step 2: Attempting to create the isFree column ---');
        const { error: alterError } = await supabase.rpc('execute_sql', {
          sql_query: `
            ALTER TABLE ambassador_profiles
            ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true
          `
        });
        
        if (alterError) {
          console.error('Error adding column:', alterError.message);
        } else {
          console.log('✅ Successfully added isFree column to the table');
        }
      }
    }
  } catch (err) {
    console.error('Unexpected error during column check/create:', err);
  }
  
  // Attempt 2: Try to use a different approach - use meta_data JSON column
  console.log('\n--- Step 3: Setting up a workaround using meta_data column ---');
  try {
    // First check if meta_data column exists
    const { data: metaDataExists, error: metaCheckError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'meta_data'
      `
    });
    
    if (metaCheckError) {
      console.error('Error checking meta_data column:', metaCheckError.message);
    } else {
      if (!(metaDataExists && metaDataExists.length > 0)) {
        console.log('meta_data column does not exist, creating it...');
        const { error: createMetaError } = await supabase.rpc('execute_sql', {
          sql_query: `
            ALTER TABLE ambassador_profiles
            ADD COLUMN IF NOT EXISTS meta_data JSONB DEFAULT '{}'::jsonb
          `
        });
        
        if (createMetaError) {
          console.error('Error creating meta_data column:', createMetaError.message);
        } else {
          console.log('✅ Successfully added meta_data column');
        }
      } else {
        console.log('✅ meta_data column exists');
      }
      
      // Try to update all ambassador profiles to store isFree in meta_data
      console.log('Setting default isFree=true in meta_data for all profiles...');
      const { error: updateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE ambassador_profiles
          SET meta_data = meta_data || '{"isFree": true}'::jsonb
          WHERE meta_data->>'isFree' IS NULL
        `
      });
      
      if (updateError) {
        console.error('Error updating meta_data:', updateError.message);
      } else {
        console.log('✅ Successfully updated all profiles with default isFree in meta_data');
      }
    }
  } catch (err) {
    console.error('Unexpected error during meta_data setup:', err);
  }
  
  console.log('\n--- Step 4: Testing database access ---');
  try {
    // Try a simple query with both approaches
    const { data: profiles, error: queryError } = await supabase
      .from('ambassador_profiles')
      .select('id, meta_data')
      .limit(3);
    
    if (queryError) {
      console.error('Error querying profiles:', queryError.message);
    } else {
      console.log('Sample profiles (up to 3):');
      console.log(profiles);
      console.log('✅ Successfully queried ambassador_profiles table');
    }
  } catch (err) {
    console.error('Unexpected error during test query:', err);
  }
  
  console.log('\n--- Summary ---');
  console.log('The workaround has been set up. You can now modify your application to:');
  console.log('1. Try using the direct isFree column first');
  console.log('2. Fall back to meta_data->isFree if the direct column fails');
  console.log('3. Make sure to restart your application and clear browser caches');
}

diagnoseAndFix().catch(err => console.error('Top-level error:', err)); 