
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types/database.types';

// Define User interface locally to avoid circular dependencies
interface User {
  id: string;
  email: string;
  created_at?: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    full_name?: string;
    avatar_url?: string;
    phone_number?: string;
    date_of_birth?: string;
    country?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    patient_id?: string;
  };
}

// Create a version of the hook that doesn't use router-dependent features
const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Helper function to get dashboard URL based on role
  const getDashboardUrlForRole = useCallback((role?: string) => {
    console.log('Getting dashboard URL for role:', role);
    switch (role) {
      case 'therapist':
        return '/therapist-dashboard';
      case 'ambassador':
        return '/ambassador-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'patient':
        return '/patient-dashboard';
      default:
        return '/';
    }
  }, []);

  const getDashboardUrl = useCallback(() => {
    return getDashboardUrlForRole(userRole || undefined);
  }, [userRole, getDashboardUrlForRole]);

  useEffect(() => {
    // Check for active session on mount
    let isMounted = true;
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user && isMounted) {
          // Cast to our User type since Supabase user types don't exactly match our custom User type
          const supabaseUser = data.session.user as unknown as User;
          setUser(supabaseUser);
          const role = supabaseUser.user_metadata?.role || null;
          setUserRole(role);
          console.log('Auth session found, user role:', role);
        } else {
          setUser(null);
          setUserRole(null);
          console.log('No auth session found');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user && isMounted) {
          // Cast to our User type
          const supabaseUser = session.user as unknown as User;
          setUser(supabaseUser);
          const role = supabaseUser.user_metadata?.role || null;
          setUserRole(role);
          setIsAuthenticating(false);
        } else if ((event === 'SIGNED_OUT' || event === 'USER_DELETED') && isMounted) {
          setUser(null);
          setUserRole(null);
          setIsAuthenticating(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    userRole,
    isLoading,
    isAuthenticating,
    isAuthenticated: !!user,
    getDashboardUrl,
    getDashboardUrlForRole,
    setIsAuthenticating
  };
};

// Main hook that includes router functionality
export const useAuth = () => {
  const auth = useAuthState();
  const navigate = useNavigate();
  
  const logout = async () => {
    try {
      console.log('Logout initiated');
      auth.setIsAuthenticating(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }

      toast.success('Logged out successfully');
      navigate('/');
      console.log('Logout completed');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      auth.setIsAuthenticating(false);
    }
  };

  // Helper to get the full name from user metadata
  const getFullName = () => {
    if (!auth.user) return '';
    
    if (auth.user.user_metadata?.full_name) {
      return auth.user.user_metadata.full_name;
    }
    
    const firstName = auth.user.user_metadata?.first_name || '';
    const lastName = auth.user.user_metadata?.last_name || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'User';
  };

  return {
    ...auth,
    logout,
    getFullName
  };
};

// Export both a named export and a default export
export default useAuth;
