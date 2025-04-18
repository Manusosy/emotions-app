import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const { getDashboardUrlForRole, setIsAuthenticating, isAuthenticated, userRole } = useAuth();
  
  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    // If already authenticated, redirect to dashboard or booking
    if (isAuthenticated && userRole && !redirecting) {
      console.log(`User already authenticated as ${userRole}, redirecting...`);
      setRedirecting(true);
      
      // Check for booking intent
      const bookingIntent = localStorage.getItem("bookingIntent");
      const bookingData = localStorage.getItem("bookingData");
      
      if (bookingIntent && bookingData) {
        // Clear booking intent and data from local storage
        localStorage.removeItem("bookingIntent");
        localStorage.removeItem("bookingData");
        
        // Parse the booking intent
        const { ambassadorId } = JSON.parse(bookingIntent);
        
        // Navigate to booking page
        console.log(`Redirecting to booking page with ambassador ID: ${ambassadorId}`);
        navigate(`/booking?ambassadorId=${ambassadorId}`);
      } else {
        // No booking intent, redirect to dashboard
        const dashboardUrl = getDashboardUrlForRole(userRole);
        console.log(`Redirecting to ${dashboardUrl}`);
        
        // Navigate to dashboard
        navigate(dashboardUrl, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, getDashboardUrlForRole, redirecting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || redirecting) return;
    
    setIsLoading(true);
    setIsAuthenticating(true);
    
    try {
      console.log("Attempting login with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Get the user's role from metadata
        const role = data.user.user_metadata?.role || 'patient';
        
        // Check for booking intent
        const bookingIntent = localStorage.getItem("bookingIntent");
        const bookingData = localStorage.getItem("bookingData");
        
        // Set redirecting state to prevent multiple redirects
        setRedirecting(true);
        
        if (bookingIntent && bookingData) {
          // Clear booking intent from local storage but keep bookingData
          // We'll remove bookingData after the booking is completed
          localStorage.removeItem("bookingIntent");
          
          // Parse the booking intent
          const { ambassadorId } = JSON.parse(bookingIntent);
          
          toast.success("Signed in successfully! Redirecting to booking...");
          console.log(`Login successful as ${role}, redirecting to booking with ambassador ID: ${ambassadorId}`);
          
          // Navigate to booking page
          navigate(`/booking?ambassadorId=${ambassadorId}`);
        } else {
          // No booking intent, redirect to dashboard
          const dashboardUrl = getDashboardUrlForRole(role);
          
          toast.success(`Signed in successfully! Redirecting to dashboard...`);
          console.log(`Login successful as ${role}, redirecting to ${dashboardUrl}`);
          
          // Navigate to the appropriate dashboard
          navigate(dashboardUrl, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      setRedirecting(false);
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
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
            disabled={redirecting || isLoading}
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
            disabled={redirecting || isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || redirecting}
          variant="brand"
        >
          {isLoading ? "Logging in..." : redirecting ? "Redirecting..." : "Login"}
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
