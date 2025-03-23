
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
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          // Fetch user role from metadata
          const role = data.session.user.user_metadata?.role || 'patient';
          setUserRole(role as UserRole);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          const role = session.user.user_metadata?.role || 'patient';
          setUserRole(role as UserRole);
          toast.success('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setUserRole('patient');
          toast.info('Signed out successfully');
        }
        setIsLoading(false);
      }
    );

    checkSession();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out.');
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
