// Script to create the execute_sql function
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key
const SUPABASE_URL = "https://ekpiqiatfwozmepkgbbe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL to create the execute_sql function
const CREATE_FUNCTION_SQL = `
  CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER -- This is needed to allow the function to run with the privileges of the creator
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

async function createFunction() {
  console.log("Creating execute_sql function...");
  
  try {
    // We can't use the execute_sql function since it doesn't exist yet
    // We'll use a SQL query directly
    const { error } = await supabase.from('_temp_create_execute_sql')
      .insert({ dummy: 1 })
      .select()
      .then(() => ({ error: null }))  // This will fail, but it's expected
      .catch(async () => {
        // Now try to create the function via the Supabase REST API
        // This is a workaround since we can't directly execute arbitrary SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          },
          body: JSON.stringify({ sql_query: CREATE_FUNCTION_SQL })
        });
        
        if (!response.ok) {
          // Function doesn't exist yet, we need to create it manually
          console.log("Please create the execute_sql function manually in the Supabase SQL Editor:");
          console.log("\n" + CREATE_FUNCTION_SQL + "\n");
          console.log("After creating the function, run the fix-database.js script again.");
          return { error: null };  // No error, just instructions
        }
        
        return { error: null };
      });
    
    if (error) {
      console.error("Error creating function:", error);
      process.exit(1);
    }
    
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Exception:", err);
    process.exit(1);
  }
}

createFunction(); 