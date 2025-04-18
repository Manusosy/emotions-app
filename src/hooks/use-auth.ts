// Authentication hooks with properly structured exports
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'patient' | 'ambassador' | 'admin';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use a callback for getting dashboard URL for a role
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

  // Callback to get dashboard URL for current user
  const getDashboardUrl = useCallback(() => {
    return getDashboardUrlForRole(userRole);
  }, [userRole, getDashboardUrlForRole]);

  // This function handles state updates when auth changes
  const handleAuthChange = useCallback((session: any) => {
    if (!session) {
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      return;
    }
    
    setUser(session.user);
    setIsAuthenticated(true);
    
    // Fetch user role from metadata
    const role = session.user.user_metadata?.role || 'patient';
    setUserRole(role as UserRole);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        // Only process relevant auth events - ignore others to avoid interference
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          handleAuthChange(session);
        }
        
        if (event !== 'TOKEN_REFRESHED') {
          setIsLoading(false);
        }
      }
    );

    // Initial session check - only done once on component mount
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (isMounted) {
          handleAuthChange(data.session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    checkSession();
    
    // Cleanup subscription and mounted state
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  const logout = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticating(false);
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
