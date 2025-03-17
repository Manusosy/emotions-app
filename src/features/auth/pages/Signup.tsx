
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
import { Card, CardContent } from "@/components/ui/card";
import AuthLayout from "../components/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "../utils/countries";
import { UserRole } from "@/types/database.types";
import { User, Heart, UserPlus, Info, Eye, EyeOff } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";

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
    country: "",
    role: "patient" as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions to continue.");
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const { data: usersData, error: userCheckError } = await supabase.auth.admin.listUsers();
      
      if (!userCheckError && usersData?.users) {
        // Type check for the user object and safely access email property
        const existingUser = usersData.users.find(user => {
          return user && 
                 typeof user === 'object' && 
                 'email' in user && 
                 typeof user.email === 'string' && 
                 user.email === formData.email;
        });
        
        if (existingUser) {
          toast.error("An account with this email already exists. Please login instead.");
          navigate("/login");
          return;
        }
      } else if (userCheckError) {
        console.warn("Could not check for existing user:", userCheckError);
      }

      // Continue with signup if no existing user found
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            country: formData.country,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("An account with this email already exists. Please login instead.");
          navigate("/login");
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user?.id) throw new Error("Failed to create account. Please try again.");

      const profileData = {
        id: signUpData.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Set the table name based on role
      const tableMap: Record<string, string> = {
        admin: 'admin_users',
        patient: 'patient_profiles',
        therapist: 'therapist_profiles',
        ambassador: 'ambassador_profiles'
      };
      
      const tableName = tableMap[formData.role];
      
      // Each table has specific extra fields based on role
      const roleSpecificData = formData.role === 'patient' 
        ? {
            medical_history: '',
            emergency_contact: '',
            preferred_language: 'English',
            date_of_birth: null,
            gender: '',
            blood_type: ''
          }
        : formData.role === 'therapist'
        ? {
            speciality: 'General',
            availability_status: 'Available',
            bio: '',
            hourly_rate: 0,
            years_of_experience: 0,
            license_number: '',
            education: ''
          }
        : formData.role === 'ambassador'
        ? {
            speciality: 'Mental Health',
            availability_status: 'Available',
            bio: '',
            hourly_rate: 0,
            total_referrals: 0,
            rating: 0
          }
        : {};
      
      // Use type assertion to avoid complex type resolution
      const { error: profileError } = await supabase
        .from(tableName as any)
        .insert([{
          ...profileData,
          ...roleSpecificData
        }]);

      if (profileError) throw profileError;

      toast.success("Your account has been created successfully!");
      
      switch (formData.role) {
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
      console.error("Signup process error:", error);
      
      if (error.message?.includes("already registered")) {
        toast.error("An account with this email already exists. Please login instead.");
        navigate("/login");
        return;
      }
      
      toast.error(error.message || "Failed to create account. Please try again.");
      
      if (error.message?.includes('profile')) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsLoading(false);
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
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
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
          >
            {Object.entries(roleInfo).map(([role, info]) => (
              <Label
                key={role}
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${
                  formData.role === role ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem value={role} className="sr-only" />
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
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
          disabled={isLoading || !agreedToTerms}
          variant="brand"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
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
