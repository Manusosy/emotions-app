// Script to apply database migrations to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables or use default values
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ekpiqiatfwozmepkgbbe.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Must be provided as env var

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY is required');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Read our migration SQL file
    const migrationFilePath = path.join(__dirname, 'migrations', 'add_ambassador_profiles_columns.sql');
    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the SQL as a single transaction
    console.log('Applying ambassador profiles schema migration...');
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: migrationSql
    });
    
    if (error) {
      console.error('Error applying migrations:', error);
      process.exit(1);
    }
    
    console.log('Migrations applied successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
applyMigrations(); 