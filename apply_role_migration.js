// Script to apply the role migration to Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

// SQL to create the execute_sql function if it doesn't exist
const CREATE_EXECUTE_SQL_FUNCTION = `
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql TO anon;
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;
`;

async function ensureExecuteSqlFunction() {
  try {
    // Try to call the function to check if it exists
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1;'
    });

    if (error && error.message.includes('function execute_sql does not exist')) {
      console.log('Creating execute_sql function...');
      
      // Create the function directly through SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: CREATE_EXECUTE_SQL_FUNCTION
        })
      });

      if (!response.ok) {
        console.error('Error creating execute_sql function. Please create it manually in the Supabase SQL Editor:');
        console.error(CREATE_EXECUTE_SQL_FUNCTION);
        process.exit(1);
      }
      
      console.log('execute_sql function created successfully!');
    }
    return true;
  } catch (error) {
    console.error('Error checking/creating execute_sql function:', error.message);
    return false;
  }
}

async function applyMigration() {
  try {
    // Ensure the execute_sql function exists
    const functionExists = await ensureExecuteSqlFunction();
    if (!functionExists) {
      console.error('Could not ensure execute_sql function exists. Please create it manually.');
      process.exit(1);
    }

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20240328000000_fix_auth_display_role.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration to Supabase...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: migrationSql
    });

    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }

    console.log('Migration applied successfully!');
    console.log('User roles should now be visible in the Supabase authentication dashboard.');
    console.log('Please refresh your Supabase dashboard to see the changes.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyMigration(); 