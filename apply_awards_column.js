// Script to apply the awards column migration
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
    const migrationPath = path.join(__dirname, 'supabase/migrations/20240610000000_add_awards_column.sql');
    let migrationSql;
    
    try {
      migrationSql = fs.readFileSync(migrationPath, 'utf8');
    } catch (err) {
      console.error(`Error reading migration file: ${err.message}`);
      console.log('Creating migration file with default content...');
      
      migrationSql = `
-- Add missing 'awards' column to ambassador_profiles table
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
$$;`;
      
      // Create the directory if it doesn't exist
      const dir = path.dirname(migrationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the migration file
      fs.writeFileSync(migrationPath, migrationSql, 'utf8');
      console.log('Created migration file at:', migrationPath);
    }

    console.log('Applying migration to Supabase...');
    
    // Apply using execute_sql RPC function if available
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: migrationSql
      });

      if (error) {
        console.error('Error applying migration via RPC:', error);
        throw new Error('RPC method failed');
      } else {
        console.log('Migration applied successfully via RPC!');
        return;
      }
    } catch (rpcError) {
      console.log('RPC method not available or failed, trying direct SQL execution...');
      
      // Alternative method: execute direct SQL query
      const { error } = await supabase.from('_exec_sql').select('*').eq('query', migrationSql).single();
      
      if (error) {
        console.error('Error applying migration via direct SQL:', error);
        console.error('Please run the SQL manually in the Supabase dashboard SQL editor.');
        console.log('SQL to run:');
        console.log(migrationSql);
        process.exit(1);
      }
    }

    console.log('Migration applied successfully!');
    console.log('The awards column is now available in the ambassador_profiles table.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Please run the migration manually in the Supabase dashboard SQL editor.');
    process.exit(1);
  }
}

// Run the migration
applyMigration(); 