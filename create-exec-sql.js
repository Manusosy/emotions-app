import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekpiqiatfwozmepkgbbe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createExecSqlFunction() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'soitaemanuel@gmail.com',
      password: 'your_password_here' // You'll need to provide this
    });

    if (error) {
      console.error('Error signing in:', error);
      return;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.session.access_token}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: `
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$;
        `
      })
    });

    if (!response.ok) {
      console.error('Error creating exec_sql function:', await response.text());
      return;
    }
    console.log('exec_sql function created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createExecSqlFunction(); 