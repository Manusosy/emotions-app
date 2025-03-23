
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AuthLayout from "../components/AuthLayout";
import { countries } from "../utils/countries";
import { User, Heart, UserPlus, Info, Eye, EyeOff } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/hooks/use-auth";

const roleInfo = {
  patient: {
    title: "Patient Account",
    description: "Access personalized health tracking, book appointments with therapists, and manage your medical records.",
    features: [
      "Track health metrics",
      "Book appointments",
      "Access medical records",
      "Chat with therapists"
    ]
  },
  therapist: {
    title: "Therapist Account",
    description: "Professional account for licensed therapists to provide services and manage patients.",
    features: [
      "Manage patient appointments",
      "Access patient records",
      "Professional dashboard",
      "Secure messaging system"
    ]
  },
  ambassador: {
    title: "Mental Health Ambassador",
    description: "Join our network of mental health advocates and certified therapists dedicated to raising awareness and providing support.",
    features: [
      "Provide therapy sessions",
      "Organize awareness campaigns",
      "Host mental health workshops",
      "Community outreach programs"
    ]
  }
};

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    role: "patient" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccessful, setSignupSuccessful] = useState(false);
  const navigate = useNavigate();
  const { getDashboardUrlForRole, setIsAuthenticating } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (!formData.country) {
      toast.error("Please select your country");
      return;
    }
    
    setIsLoading(true);
    setIsAuthenticating(true);
    
    try {
      console.log("Starting signup process with role:", formData.role);
      
      // Create user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            country: formData.country,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully!");
      setSignupSuccessful(true);
      
      // Redirect to the appropriate dashboard
      const dashboardUrl = getDashboardUrlForRole(formData.role);
      console.log(`User signed up as ${formData.role}, redirecting to ${dashboardUrl}`);
      
      // Slight delay to allow the toast to be seen
      setTimeout(() => {
        navigate(dashboardUrl);
      }, 1000);
      
    } catch (error: any) {
      console.error("Signup process error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Sign up to get started with our services"
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={isLoading || signupSuccessful}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isLoading || signupSuccessful}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading || signupSuccessful}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading || signupSuccessful}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || signupSuccessful}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading || signupSuccessful}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || signupSuccessful}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
              disabled={isLoading || signupSuccessful}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Account Type</Label>
          <RadioGroup
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
            className="grid gap-4 md:grid-cols-3"
            disabled={isLoading || signupSuccessful}
          >
            {Object.entries(roleInfo).map(([role, info]) => (
              <Label
                key={role}
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${
                  formData.role === role ? "border-primary" : ""
                } ${(isLoading || signupSuccessful) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <RadioGroupItem value={role} className="sr-only" disabled={isLoading || signupSuccessful} />
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="flex items-center gap-2">
                      {role === "patient" && <User className="h-6 w-6" />}
                      {role === "therapist" && <Heart className="h-6 w-6" />}
                      {role === "ambassador" && <UserPlus className="h-6 w-6" />}
                      <span className="font-medium">{info.title}</span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{info.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {info.description}
                      </p>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {info.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isLoading || signupSuccessful}
          />
          <label
            htmlFor="terms"
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${(isLoading || signupSuccessful) ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              terms and conditions
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !agreedToTerms || signupSuccessful}
          variant="brand"
        >
          {isLoading ? "Creating Account..." : signupSuccessful ? "Account Created!" : "Create Account"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
