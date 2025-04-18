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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import AuthLayout from "../components/AuthLayout";
import { countries } from "../utils/countries";
import { User, UserPlus, Eye, EyeOff, Mail, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/hooks/use-auth";

const roleInfo = {
  patient: {
    title: "Patient Account",
    description: "Access personalized health tracking, book appointments with mental health ambassadors, and track your wellness journey.",
  },
  ambassador: {
    title: "Mental Health Ambassador",
    description: "Join our network of mental health advocates dedicated to providing support and raising awareness.",
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
    gender: "",
    role: "patient" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    
    if (formData.role === "ambassador" && !formData.gender) {
      toast.error("Please select your gender");
      return;
    }
    
    if (!agreedToTerms) {
      toast.error("You must agree to the terms and privacy policy");
      return;
    }
    
    setIsLoading(true);

    try {
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
            gender: formData.gender || null,
            onboarding_completed: true,
          }
        }
      });
      
      if (error) throw error;
      
      // Determine where to go next
      const targetPath = formData.role === 'ambassador' 
        ? '/ambassador-dashboard' 
        : '/patient-dashboard';
      
      // Sign in immediately after sign up to ensure session is created
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) throw signInError;
      
      // Navigate directly after login
      navigate(targetPath, { replace: true });
      
    } catch (error: any) {
      console.error("Signup error:", error);
      setIsLoading(false);
      
      if (error.message.includes("already")) {
        toast.error("This email is already in use. Please try logging in instead.");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role: role as UserRole });
  };

  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Sign up to get started with our services"
    >
      <Tabs
        value={formData.role}
        onValueChange={handleRoleChange}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patient" disabled={isLoading}>
            <User className="mr-2 h-4 w-4" />
            Patient
          </TabsTrigger>
          <TabsTrigger value="ambassador" disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" />
            Ambassador
          </TabsTrigger>
        </TabsList>
        <TabsContent value="patient" className="mt-2">
          <div className="bg-muted/40 rounded-lg p-3">
            <h3 className="font-medium">{roleInfo.patient.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{roleInfo.patient.description}</p>
          </div>
        </TabsContent>
        <TabsContent value="ambassador" className="mt-2">
          <div className="bg-muted/40 rounded-lg p-3">
            <h3 className="font-medium">{roleInfo.ambassador.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{roleInfo.ambassador.description}</p>
          </div>
        </TabsContent>
      </Tabs>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
              disabled={isLoading}
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

          {formData.role === "ambassador" && (
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This helps patients filter ambassadors by gender preference</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-6">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              terms and conditions
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading || !agreedToTerms}
          variant="brand"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="flex justify-between items-center text-center text-sm text-gray-600 mt-4">
          <Link to="/login" className="text-primary hover:underline">
            Already have an account? Login
          </Link>
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
