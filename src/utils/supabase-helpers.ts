import { supabase } from "@/integrations/supabase/client";

/**
 * Tests the connection to Supabase by performing a simple query
 * @returns Promise with connection status
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    // Try to fetch a count from a public table
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { 
        ok: false, 
        message: `Connection error: ${error.message}` 
      };
    }
    
    return { 
      ok: true, 
      message: 'Connected to Supabase successfully' 
    };
  } catch (err: any) {
    console.error('Supabase connection test exception:', err);
    return { 
      ok: false, 
      message: err.message || 'Unknown error connecting to Supabase' 
    };
  }
}

/**
 * Checks if the database schema is correctly set up by checking for required tables
 */
export async function checkDatabaseSchema(): Promise<{ ok: boolean; missingTables: string[] }> {
  const requiredTables = ['profiles', 'appointments', 'messages', 'notifications'];
  const missingTables = [];
  
  for (const table of requiredTables) {
    try {
      // Try to fetch one row from each required table
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error && error.code === '42P01') { // PostgreSQL table doesn't exist error
        missingTables.push(table);
      }
    } catch (err) {
      console.error(`Error checking table ${table}:`, err);
      missingTables.push(table);
    }
  }
  
  return {
    ok: missingTables.length === 0,
    missingTables
  };
}

/**
 * Logs current Supabase session information for debugging
 */
export async function logSessionInfo(): Promise<void> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error fetching session:', error);
      return;
    }
    
    if (data.session) {
      console.log('User is authenticated:', data.session.user.id);
      console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toLocaleString());
    } else {
      console.log('No active session found');
    }
  } catch (err) {
    console.error('Exception fetching session info:', err);
  }
} 