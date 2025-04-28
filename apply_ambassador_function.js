// Script to apply the ambassador user function to Supabase
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

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20240329000001_add_ambassador_user_function.sql');
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
    console.log('get_ambassador_users() function is now available for use.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyMigration(); 