
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'patient' | 'ambassador' | 'admin';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use refs to track mounted state and prevent memory leaks
  const isMountedRef = useRef(true);
  const authInitializedRef = useRef(false);
  
  // Memoize the getDashboardUrlForRole function to prevent unnecessary rerenders
  const getDashboardUrlForRole = useCallback((role: UserRole | null): string => {
    if (!role) return '/';
    
    switch (role) {
      case 'ambassador':
        return '/ambassador-dashboard';
      case 'patient':
        return '/patient-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  }, []);
  
  const getDashboardUrl = useCallback(() => {
    return getDashboardUrlForRole(userRole);
  }, [getDashboardUrlForRole, userRole]);
  
  // This function handles auth state updates in a consistent way
  const updateAuthState = useCallback((session: any) => {
    if (!isMountedRef.current) return;
    
    if (session?.user) {
      setUser(session.user);
      setIsAuthenticated(true);
      
      // Get role from metadata with fallback to patient
      const role = session.user.user_metadata?.role || 'patient';
      setUserRole(role as UserRole);
      console.log(`Auth state updated: User authenticated as ${role}`);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      console.log("Auth state updated: User not authenticated");
    }
    
    // Always set loading to false after processing auth state
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    console.log("Setting up auth state management");
    isMountedRef.current = true;
    
    const setupAuth = async () => {
      try {
        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log(`Auth event: ${event}`, session?.user?.id);
            updateAuthState(session);
            
            // Special handling for sign in
            if (event === 'SIGNED_IN' && isMountedRef.current) {
              console.log('User signed in successfully');
              // Adding a small delay to ensure all auth state updates complete
              setTimeout(() => {
                if (isMountedRef.current) {
                  setIsAuthenticating(false);
                }
              }, 300);
            }
          }
        );
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          throw error;
        }
        
        // Initial auth state update
        updateAuthState(data.session);
        authInitializedRef.current = true;
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth setup:', error);
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    setupAuth();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [updateAuthState]);

  const logout = async () => {
    if (isAuthenticating) return;
    
    console.log("Logout function called");
    setIsAuthenticating(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during sign out:", error.message);
        throw error;
      }
      
      // Toast will be shown once the auth state changes
      
      // Small timeout to ensure state updates before any navigation
      return new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out: ' + (error.message || 'Unknown error'));
      throw error; 
    } finally {
      if (isMountedRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const getFullName = useCallback(() => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
           'User';
  }, [user]);

  return {
    user,
    userRole,
    isLoading,
    isAuthenticating,
    isAuthenticated,
    logout,
    getFullName,
    getDashboardUrl,
    getDashboardUrlForRole,
    setIsAuthenticating
  };
};

export const useAuthState = useAuth;
export default useAuth;
