
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole, User } from '@/types/database.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          // Cast to our User type since Supabase user types don't exactly match our custom User type
          const supabaseUser = data.session.user as unknown as User;
          setUser(supabaseUser);
          setUserRole(supabaseUser.user_metadata?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Cast to our User type
          const supabaseUser = session.user as unknown as User;
          setUser(supabaseUser);
          setUserRole(supabaseUser.user_metadata?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getDashboardUrl = () => {
    switch (userRole) {
      case 'therapist':
        return '/therapist-dashboard';
      case 'ambassador':
        return '/ambassador-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'patient':
        return '/patient-dashboard';
      default:
        return '/login';
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear user data
      setUser(null);
      setUserRole(null);

      toast.success('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log out');
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
    isAuthenticated: !!user,
    getDashboardUrl,
    logout,
    getFullName
  };
};
