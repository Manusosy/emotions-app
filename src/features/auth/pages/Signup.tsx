import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import { countries } from "../utils/countries";
import { User, UserPlus, Eye, EyeOff, Mail, Key } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

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

type ValidationErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  gender?: string;
  terms?: string;
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated, userRole, getDashboardUrlForRole, directNavigateToDashboard, isLoading: authLoading } = useAuth();

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

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Validate email
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Validate country
    if (!formData.country) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    // Validate gender for ambassadors
    if (formData.role === "ambassador" && !formData.gender) {
      newErrors.gender = "Gender is required for ambassadors";
      isValid = false;
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and privacy policy";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Create user with our auth service
      const { data, error } = await signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        country: formData.country,
        gender: formData.gender || null,
      });
      
      if (error) {
        toast.error(`Failed to create account: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        toast.error("Failed to create account: No user data returned");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      
      // Check if there's a redirect URL in the query parameters
      const redirectUrl = getRedirectUrl();
      
      if (redirectUrl) {
        console.log(`Signup successful, redirecting to: ${redirectUrl}`);
        navigate(decodeURIComponent(redirectUrl), { replace: true });
      } else {
        // If no redirect URL, use default dashboard navigation
        const role = formData.role;
        const absoluteDashboardUrl = role === 'ambassador' 
          ? 'http://localhost:8080/ambassador-dashboard'
          : 'http://localhost:8080/patient-dashboard';
        
        console.log(`DIRECT NAVIGATION TO: ${absoluteDashboardUrl}`);
        
        // DIRECT NAVIGATION - NO REACT ROUTER 
        window.location.href = absoluteDashboardUrl;
      }
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(`Failed to create account: ${error.message || "Unknown error"}`);
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({ ...formData, role: role as UserRole });
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
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                required
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
            {formData.password && formData.password.length < 6 && !errors.password && (
              <p className="text-xs text-red-500">Password must be at least 6 characters</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                required
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && !errors.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => {
                setFormData({ ...formData, country: value });
                if (errors.country) {
                  setErrors({ ...errors, country: undefined });
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="country" className={`w-full ${errors.country ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-red-500">{errors.country}</p>
            )}
          </div>

          {formData.role === "ambassador" && (
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => {
                  setFormData({ ...formData, gender: value });
                  if (errors.gender) {
                    setErrors({ ...errors, gender: undefined });
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="gender" className={`w-full ${errors.gender ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-red-500">{errors.gender}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => {
                setAgreedToTerms(checked as boolean);
                if (errors.terms) {
                  setErrors({ ...errors, terms: undefined });
                }
              }}
              disabled={isLoading}
              className={errors.terms ? 'border-red-500' : ''}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isLoading}
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
