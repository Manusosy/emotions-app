import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: 'patient' | 'therapist' | 'ambassador' | 'admin';
  };
}

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
        setUser(data.session?.user || null);
        setUserRole(data.session?.user?.user_metadata?.role || null);
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
        setUser(session?.user || null);
        setUserRole(session?.user?.user_metadata?.role || null);
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

  return {
    user,
    userRole,
    isLoading,
    isAuthenticated: !!user,
    getDashboardUrl,
    logout
  };
}; 