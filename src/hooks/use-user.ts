import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
}

export function useUser() {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true);
        
        // Get user from auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;
        if (!authUser) {
          setUser(null);
          return;
        }
        
        // Get extended user info from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          // PGRST116 is the "row not found" error code
          console.error('Error fetching user data:', userError);
        }
        
        // Combine auth user with database user data
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: userData?.full_name || authUser.user_metadata?.full_name,
          role: userData?.role || authUser.user_metadata?.role || 'patient',
          avatar_url: userData?.avatar_url || authUser.user_metadata?.avatar_url
        });
      } catch (err) {
        console.error('Error in useUser hook:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
    
    // Set up auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  return { user, loading, error };
} 