import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { authService } from '@/integrations/supabase/services/auth.service';
import { userService } from '@/integrations/supabase/services/user.service';

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
      
      // Store authentication in localStorage to persist through refreshes
      localStorage.setItem('auth_state', JSON.stringify({
        isAuthenticated: true,
        userRole: role,
        userId: session.user.id
      }));
      
      // Only auto-redirect if on login/signup pages
      if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
        // Auto-redirect to dashboard when authenticated
        const dashboardUrl = getDashboardUrlForRole(role as UserRole);
        console.log(`Auto redirecting to dashboard: ${dashboardUrl}`);
        
        // Use window.location for a complete refresh to ensure auth state is recognized
        window.location.href = dashboardUrl;
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      console.log("Auth state updated: User not authenticated");
      
      // Clear stored authentication state
      localStorage.removeItem('auth_state');
    }
    
    // Always set loading to false after processing auth state
    setIsLoading(false);
  }, [getDashboardUrlForRole]);
  
  // Add this new effect to check localStorage on mount
  useEffect(() => {
    // Check if we have stored auth state in localStorage
    const storedAuthState = localStorage.getItem('auth_state');
    if (storedAuthState) {
      try {
        const { isAuthenticated: storedAuth, userRole: storedRole } = JSON.parse(storedAuthState);
        
        // If we're on the login or signup page and have stored auth, redirect to dashboard
        if (storedAuth && storedRole && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
          console.log("Found stored auth state, redirecting to dashboard");
          const dashboardUrl = getDashboardUrlForRole(storedRole as UserRole);
          window.location.href = dashboardUrl;
        }
      } catch (e) {
        console.error("Error parsing stored auth state:", e);
        localStorage.removeItem('auth_state');
      }
    }
  }, [getDashboardUrlForRole]);
  
  useEffect(() => {
    console.log("Setting up auth state management");
    isMountedRef.current = true;
    
    const setupAuth = async () => {
      try {
        console.log('Setting up auth listeners...');
        
        // Subscribe to auth state changes
        const { data: authListenerData } = authService.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event);
            
            // Check for mount before updating state
            if (!isMountedRef.current) return;
            
            // Handle session updates
            updateAuthState(session);
            
            // Special handling for sign in
            if (event === 'SIGNED_IN' && isMountedRef.current) {
              console.log('User signed in successfully');
              // Remove the timeout - update state immediately
              if (isMountedRef.current) {
                setIsAuthenticating(false);
              }
            }
          }
        );
        
        // Then check for existing session
        const { data, error } = await authService.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          throw error;
        }
        
        // Initial auth state update
        updateAuthState(data.session);
        authInitializedRef.current = true;
        
        return () => {
          // Properly unsubscribe from auth listener
          if (authListenerData?.subscription?.unsubscribe) {
            authListenerData.subscription.unsubscribe();
          }
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

  const login = async (email: string, password: string) => {
    if (isAuthenticating) return null;
    
    console.log("Login function called");
    setIsAuthenticating(true);
    
    try {
      const { data, error } = await authService.signIn({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Signed in successfully!");
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to sign in: ' + (error.message || 'Invalid credentials'));
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const signup = async (signupData: {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole,
    country: string,
    gender?: string | null,
  }) => {
    if (isAuthenticating) return { data: null, error: new Error("Authentication already in progress") };
    
    console.log("Signup function called", signupData.email);
    setIsAuthenticating(true);
    
    try {
      // Step 1: Sign up the user
      const response = await authService.signUp({
        email: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        role: signupData.role,
        country: signupData.country,
        gender: signupData.gender
      });
      
      if (response.error) {
        console.error('Signup response error:', response.error);
        return { data: null, error: response.error };
      }
      
      const { data } = response;
      
      if (!data.user) {
        console.error('Signup returned no user data');
        return { data: null, error: new Error("No user data returned") };
      }
      
      // Step 2: Sign in immediately after signup to get a session
      console.log('Automatically signing in after signup');
      const signInResponse = await authService.signIn({
        email: signupData.email,
        password: signupData.password
      });
      
      if (signInResponse.error) {
        console.error('Auto sign-in after signup failed:', signInResponse.error);
        // Even if sign-in fails, signup succeeded
        return { data, error: null };
      }
      
      // Manually set auth state to skip any potential delays
      if (signInResponse.data?.session) {
        setUser(signInResponse.data.user);
        setIsAuthenticated(true);
        setUserRole(signupData.role);
      }
      
      // Successfully signed up and signed in
      console.log('Auto sign-in after signup successful');
      toast.success("Account created successfully!");
      
      // Return the sign-in response data which contains the latest session
      return { data: signInResponse.data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { data: null, error };
    } finally {
      if (isMountedRef.current) {
        setIsAuthenticating(false);
      }
    }
  };

  const signout = async () => {
    if (isAuthenticating) return;
    
    console.log("Signout function called");
    setIsAuthenticating(true);
    
    try {
      const { error } = await authService.signOut();
      if (error) {
        console.error("Error during sign out:", error.message);
        throw error;
      }
      
      // Explicitly reset auth state after successful sign-out
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
      
      // Clear stored authentication state
      localStorage.removeItem('auth_state');
      
      // Let the component handle redirects
      return;
    } catch (error: any) {
      console.error('Signout error:', error);
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

  const redirectToDashboard = useCallback(() => {
    if (!isAuthenticated || !userRole) {
      console.error("Cannot redirect: User not authenticated or role not known");
      return;
    }
    
    const dashboardUrl = getDashboardUrlForRole(userRole);
    console.log(`Redirecting to dashboard: ${dashboardUrl}`);
    
    // Use window.location for a complete refresh rather than React Router navigation
    window.location.href = dashboardUrl;
  }, [isAuthenticated, userRole, getDashboardUrlForRole]);

  // Add this function near the redirectToDashboard function
  const directNavigateToDashboard = useCallback((role: UserRole) => {
    const dashboardUrl = role === 'ambassador' ? '/ambassador-dashboard' : '/patient-dashboard';
    console.log(`Directly navigating to dashboard: ${dashboardUrl}`);
    window.location.href = dashboardUrl;
  }, []);

  return {
    user,
    userRole,
    isLoading,
    isAuthenticating,
    isAuthenticated,
    login,
    signup,
    signout,
    getFullName,
    getDashboardUrl,
    getDashboardUrlForRole,
    redirectToDashboard,
    directNavigateToDashboard,
    setIsAuthenticating
  };
};

export const useAuthState = useAuth;
export default useAuth;
