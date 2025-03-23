
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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  // Helper function to get dashboard URL based on role
  const getDashboardUrlForRole = useCallback((role?: string) => {
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
          setUserRole(supabaseUser.user_metadata?.role || null);
          console.log('Auth session found, user role:', supabaseUser.user_metadata?.role);
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
          setUserRole(supabaseUser.user_metadata?.role || null);
          setIsAuthenticating(false);
          
          // Redirect to dashboard after successful sign-in
          const dashboardUrl = getDashboardUrlForRole(supabaseUser.user_metadata?.role);
          console.log('Redirecting to dashboard:', dashboardUrl);
          navigate(dashboardUrl);
        } else if ((event === 'SIGNED_OUT' || event === 'USER_DELETED') && isMounted) {
          setUser(null);
          setUserRole(null);
          setIsAuthenticating(false);
          navigate('/');
          console.log('User signed out, redirected to home');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, getDashboardUrlForRole]);

  const logout = async () => {
    try {
      console.log('Logout initiated');
      setIsAuthenticating(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }

      // Clear user data
      setUser(null);
      setUserRole(null);

      toast.success('Logged out successfully');
      navigate('/');
      console.log('Logout completed');
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast.error(error.message || 'Failed to log out');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Helper to get the full name from user metadata
  const getFullName = () => {
    if (!user) return '';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'User';
  };

  return {
    user,
    userRole,
    isLoading,
    isAuthenticating,
    isAuthenticated: !!user,
    getDashboardUrl,
    logout,
    getFullName
  };
};
