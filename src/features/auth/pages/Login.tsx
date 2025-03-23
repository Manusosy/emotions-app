
import { useState, useEffect } from "react";
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
  const navigate = useNavigate();
  const location = useLocation();
  const { getDashboardUrlForRole, setIsAuthenticating, isAuthenticated, userRole } = useAuth();

  // Check if user is already authenticated and redirect them
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const dashboardUrl = getDashboardUrlForRole(userRole);
      console.log(`User already authenticated as ${userRole}, redirecting to ${dashboardUrl}`);
      navigate(dashboardUrl, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate, getDashboardUrlForRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
        // Get the user's role and redirect to the appropriate dashboard
        const role = data.user.user_metadata?.role || 'patient';
        const dashboardUrl = getDashboardUrlForRole(role);
        console.log(`Logging in as ${role}, redirecting to ${dashboardUrl}`);
        
        toast.success(`Signed in successfully! Redirecting to dashboard...`);
        
        // Add a delay to ensure auth state is properly updated
        setTimeout(() => {
          console.log("Executing delayed navigation to:", dashboardUrl);
          navigate(dashboardUrl, { replace: true });
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
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
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          variant="brand"
        >
          {isLoading ? "Logging in..." : "Login"}
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
