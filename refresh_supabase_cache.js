// Script to refresh Supabase schema cache after migrations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// The Supabase URL and key from your environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase URL or key in environment variables');
  console.log('Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

async function refreshCache() {
  try {
    console.log('Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Attempting to refresh schema cache by querying the ambassador_profiles table...');
    
    // First, force a refresh of the schema by describing the table
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_schema_definition', { table_name: 'ambassador_profiles' })
      .select('*');

    if (schemaError) {
      console.log('Schema query might have failed, but this can be normal:', schemaError.message);
      console.log('Continuing with direct table access...');
    } else {
      console.log('Schema query successful, definition:', schema);
    }

    // Now make a query to check if we can see the isFree column
    const { data, error } = await supabase
      .from('ambassador_profiles')
      .select('id, isFree')
      .limit(1);

    if (error) {
      console.error('Error when querying isFree column:', error.message);
      if (error.message.includes('isFree')) {
        console.error('The isFree column is still not recognized by Supabase.');
        console.log('\nPossible solutions:');
        console.log('1. Make sure you ran the SQL migration correctly');
        console.log('2. Try connecting to the database directly to check if the column exists');
        console.log('3. Restart your Supabase instance if you have control over it');
        console.log('4. Wait a few minutes as schema caches might take time to refresh');
      }
    } else {
      console.log('Success! The isFree column is now recognized by Supabase.');
      console.log('Sample data:', data);
    }

    // Check for cached metadata
    console.log('\nClearing client side cache...');
    await supabase.auth.refreshSession();
    console.log('Session refreshed, which should clear some client-side caches');

    console.log('\nCache refresh operations completed.');
  } catch (error) {
    console.error('Unexpected error during schema cache refresh:', error);
  }
}

refreshCache().catch(console.error); 