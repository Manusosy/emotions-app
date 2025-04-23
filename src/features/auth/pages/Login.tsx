import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, userRole, getDashboardUrlForRole, isLoading: authLoading } = useAuth();
  
  // Get redirect URL from query parameters if it exists
  const getRedirectUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("redirect");
  };
  
  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    if (authLoading) return;
    
    if (isAuthenticated && userRole) {
      console.log("User already authenticated, redirecting to dashboard");
      const dashboardUrl = getDashboardUrlForRole(userRole);
      navigate(dashboardUrl, { replace: true });
    }
    
    setCheckingAuth(false);
  }, [isAuthenticated, userRole, navigate, getDashboardUrlForRole, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      const data = await login(email, password);

      if (data?.user) {
        toast.success("Signed in successfully!");
        
        // Check if there's a redirect URL in the query parameters
        const redirectUrl = getRedirectUrl();
        
        if (redirectUrl) {
          console.log(`Login successful, redirecting to: ${redirectUrl}`);
          navigate(decodeURIComponent(redirectUrl), { replace: true });
        } else {
          // If no redirect URL, get the dashboard URL for the user's role
          const userRole = data.user.user_metadata?.role || 'patient';
          const dashboardUrl = getDashboardUrlForRole(userRole);
          console.log(`Login successful, redirecting to dashboard: ${dashboardUrl}`);
          
          // Use window.location for a full page refresh to ensure auth state is recognized
          // This applies to both patient and ambassador roles
          window.location.href = dashboardUrl;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (checkingAuth || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

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
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button 
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isLoading}
          variant="brand"
        >
          {isLoading ? "Logging in..." : "Login"}
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
