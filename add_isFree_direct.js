// Simple direct script to ensure isFree column exists
// No dependencies - just run with: node add_isFree_direct.js <supabase-url> <supabase-api-key>

import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node add_isFree_direct.js <supabase-url> <supabase-api-key>');
  process.exit(1);
}

const supabaseUrl = args[0];
const supabaseKey = args[1];

async function addColumnDirectly() {
  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. First check if execute_sql RPC function exists
    console.log('\nChecking if execute_sql function exists...');
    try {
      const { data: functionData, error: functionError } = await supabase.rpc('execute_sql', { 
        sql_query: 'SELECT version()' 
      });
      
      if (functionError) {
        console.error('Error: execute_sql function does not exist or is not accessible.');
        console.error('You will need to use the Supabase dashboard to run SQL directly.');
        console.log('\nRun this SQL in the Supabase dashboard SQL editor:');
        console.log('ALTER TABLE ambassador_profiles ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true;');
        return;
      }
      
      console.log('✅ execute_sql function exists and is working');
    } catch (err) {
      console.error('Error checking execute_sql function:', err);
      return;
    }
    
    // 2. Check if the column already exists
    console.log('\nChecking if isFree column already exists...');
    const { data: columnCheck, error: columnCheckError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'isFree'
      `
    });
    
    if (columnCheckError) {
      console.error('Error checking column existence:', columnCheckError.message);
      return;
    }
    
    if (columnCheck && columnCheck.length > 0) {
      console.log('✅ isFree column already exists, no action needed!');
    } else {
      console.log('❌ isFree column does not exist, creating it now...');
      
      // 3. Add the column directly
      const { error: addError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE ambassador_profiles 
          ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true;
        `
      });
      
      if (addError) {
        console.error('❌ Error adding isFree column:', addError.message);
        console.log('\nIf you cannot add the column through this script, try running this SQL manually:');
        console.log('ALTER TABLE ambassador_profiles ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN DEFAULT true;');
      } else {
        console.log('✅ Successfully added isFree column to ambassador_profiles table!');
      }
    }
    
    // 4. Verify the column now exists
    console.log('\nVerifying column was added successfully...');
    const { data: verifyData, error: verifyError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ambassador_profiles' 
        AND column_name = 'isFree'
      `
    });
    
    if (verifyError) {
      console.error('Error verifying column:', verifyError.message);
    } else if (verifyData && verifyData.length > 0) {
      console.log('✅ Final verification: isFree column exists in the database!');
      console.log(verifyData);
      
      // 5. Fix any existing rows by setting isFree = true for all rows
      console.log('\nSetting default value for existing rows...');
      const { error: updateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          UPDATE ambassador_profiles 
          SET "isFree" = true 
          WHERE "isFree" IS NULL;
        `
      });
      
      if (updateError) {
        console.error('Error setting default values:', updateError.message);
      } else {
        console.log('✅ Successfully set default values for existing rows');
      }
    } else {
      console.log('❌ Final verification failed: isFree column was not added successfully');
    }
    
    console.log('\nScript completed. Now refresh your application to use the new column.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addColumnDirectly().catch(console.error); 