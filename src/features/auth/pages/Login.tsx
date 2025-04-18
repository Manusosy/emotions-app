
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { getDashboardUrlForRole, setIsAuthenticating, isAuthenticated, userRole } = useAuth();
  
  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    if (isAuthenticated && userRole && !isRedirecting) {
      console.log(`User already authenticated as ${userRole}, redirecting...`);
      setIsRedirecting(true);
      
      // Check for booking intent
      const bookingIntent = localStorage.getItem("bookingIntent");
      const bookingData = localStorage.getItem("bookingData");
      
      if (bookingIntent && bookingData) {
        // Clear booking intent and data from local storage
        localStorage.removeItem("bookingIntent");
        
        // Parse the booking intent
        const { ambassadorId } = JSON.parse(bookingIntent);
        
        // Navigate to booking page
        console.log(`Redirecting to booking page with ambassador ID: ${ambassadorId}`);
        navigate(`/booking?ambassadorId=${ambassadorId}`, { replace: true });
      } else {
        // No booking intent, redirect to dashboard
        const dashboardUrl = getDashboardUrlForRole(userRole);
        console.log(`Redirecting to ${dashboardUrl}`);
        
        // Navigate to dashboard with replace to prevent back button issues
        navigate(dashboardUrl, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, getDashboardUrlForRole, isRedirecting]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isRedirecting) return;
    
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
        setIsRedirecting(true);
        
        // Success message
        toast.success("Signed in successfully!");
        
        if (bookingIntent && bookingData) {
          // Clear booking intent from local storage but keep bookingData
          // We'll remove bookingData after the booking is completed
          localStorage.removeItem("bookingIntent");
          
          // Parse the booking intent
          const { ambassadorId } = JSON.parse(bookingIntent);
          
          console.log(`Login successful as ${role}, redirecting to booking with ambassador ID: ${ambassadorId}`);
          
          // Give the auth state time to update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Navigate to booking page with replace to prevent back button issues
          navigate(`/booking?ambassadorId=${ambassadorId}`, { replace: true });
        } else {
          // No booking intent, redirect to dashboard
          const dashboardUrl = getDashboardUrlForRole(role);
          
          console.log(`Login successful as ${role}, redirecting to ${dashboardUrl}`);
          
          // Give the auth state time to update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Navigate to the appropriate dashboard with replace to prevent back button issues
          navigate(dashboardUrl, { replace: true });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
      setIsRedirecting(false);
      setIsAuthenticating(false);
    } finally {
      setIsLoading(false);
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isRedirecting || isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isRedirecting || isLoading}
            />
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isLoading || isRedirecting}
          variant="brand"
        >
          {isLoading ? "Logging in..." : isRedirecting ? "Redirecting..." : "Login"}
        </Button>
        
        <div className="flex items-center justify-between mt-4">
          <Link to="/signup" className="text-sm text-primary hover:underline">
            Don't have an account? Sign up
          </Link>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
