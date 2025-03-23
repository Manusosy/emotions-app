
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { getDashboardUrlForRole, setIsAuthenticating, isAuthenticated, userRole } = useAuth();
  
  // Track redirect attempts to prevent infinite loops
  const redirectAttemptedRef = useRef(false);
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Set up mount/unmount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check if user is already authenticated and redirect them
  useEffect(() => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;
    
    // If we're already redirecting or have already tried to redirect, don't try again
    if (isRedirecting || redirectAttemptedRef.current) return;
    
    if (isAuthenticated && userRole) {
      console.log(`User authenticated as ${userRole}, preparing to redirect`);
      redirectAttemptedRef.current = true;
      setIsRedirecting(true);
      
      const dashboardUrl = getDashboardUrlForRole(userRole);
      console.log(`Redirecting to ${dashboardUrl}`);
      
      // Use a slight delay to ensure all state is stable before navigation
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          navigate(dashboardUrl, { replace: true });
        }
      }, 100); // Reduced timeout for faster navigation
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userRole, navigate, getDashboardUrlForRole, isRedirecting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isRedirecting) return;
    
    setIsLoading(true);
    setIsAuthenticating(true);
    redirectAttemptedRef.current = false; // Reset this flag for new login attempts

    try {
      console.log("Attempting login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get the user's role and redirect to the appropriate dashboard
        const role = data.user.user_metadata?.role || 'patient';
        const dashboardUrl = getDashboardUrlForRole(role);
        console.log(`Logging in as ${role}, redirecting to ${dashboardUrl}`);
        
        toast.success(`Signed in successfully! Redirecting to dashboard...`);
        
        // Prevent any redirection logic from running during this time
        setIsRedirecting(true);
        redirectAttemptedRef.current = true;
        
        // Make sure we only redirect if the component is still mounted
        if (isMountedRef.current) {
          // Navigate immediately instead of with a timeout
          navigate(dashboardUrl, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      setIsRedirecting(false);
      redirectAttemptedRef.current = false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsAuthenticating(false);
      }
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Login to your account to continue"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isRedirecting || isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isRedirecting || isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isRedirecting}
          variant="brand"
        >
          {isLoading ? "Logging in..." : isRedirecting ? "Redirecting..." : "Login"}
        </Button>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
