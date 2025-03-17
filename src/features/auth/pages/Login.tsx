import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");

      // Get user role from metadata
      const userRole = data.user?.user_metadata?.role || "patient";
      
      // Check for booking intent
      const bookingIntent = localStorage.getItem("bookingIntent");
      if (bookingIntent) {
        try {
          const { ambassadorId } = JSON.parse(bookingIntent);
          localStorage.removeItem("bookingIntent");
          navigate(`/booking?ambassadorId=${ambassadorId}`);
          return;
        } catch (e) {
          console.error("Error parsing booking intent", e);
        }
      }

      // Redirect based on role
      switch (userRole) {
        case "patient":
          navigate("/patient-dashboard");
          break;
        case "therapist":
          navigate("/therapist-dashboard");
          break;
        case "ambassador":
          navigate("/ambassador-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login. Please try again.");
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
