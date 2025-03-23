
// Authentication hooks with properly structured exports
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'patient' | 'ambassador' | 'admin';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('patient');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Fetch user role from metadata
          const role = session.user.user_metadata?.role || 'patient';
          setUserRole(role as UserRole);
          console.log(`User signed in with role: ${role}`);
          
          toast.success('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setUserRole('patient');
          console.log("User signed out, state reset");
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking initial Supabase session...");
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          return;
        }
        
        console.log("Initial session check result:", data.session?.user?.id);
        
        if (data.session) {
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          // Fetch user role from metadata
          const role = data.session.user.user_metadata?.role || 'patient';
          setUserRole(role as UserRole);
          console.log(`User has existing session with role: ${role}`);
        } else {
          console.log("No authenticated user found");
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log("Logout function called");
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during sign out:", error.message);
        throw error;
      }
      
      // Force reset of auth state to ensure UI updates properly
      setUser(null);
      setIsAuthenticated(false);
      setUserRole('patient');
      
      toast.success('Signed out successfully');
      
      // Small timeout to ensure state updates before any navigation
      return new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out: ' + (error.message || 'Unknown error'));
      throw error; // Re-throw to allow handling in components
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getFullName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || 
           `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
           'User';
  };

  const getDashboardUrl = () => {
    return getDashboardUrlForRole(userRole);
  };

  const getDashboardUrlForRole = (role: UserRole) => {
    console.log(`Getting dashboard URL for role: ${role}`);
    switch (role) {
      case 'ambassador':
        return '/ambassador-dashboard';
      case 'patient':
        return '/patient-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/patient-dashboard';
    }
  };

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
