import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  Building2,
  BadgeHelp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { UserProfile } from "@/types/database.types";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          return;
        }

        // Create profile from user metadata
        const userProfile: UserProfile = {
          id: user.id,
          patient_id: user.user_metadata?.patient_id || 'EMHA01P',
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email || '',
          phone_number: user.user_metadata?.phone_number || '',
          date_of_birth: user.user_metadata?.date_of_birth || '',
          country: user.user_metadata?.country || '',
          address: user.user_metadata?.address || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          pincode: user.user_metadata?.pincode || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          created_at: user.created_at || new Date().toISOString()
        };

        setProfile(userProfile);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button 
            variant="outline"
            onClick={() => navigate('/patient-dashboard/settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <BadgeHelp className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-600">
                          {profile.patient_id}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone_number && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.phone_number}</span>
                        </div>
                      )}
                      {profile.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(profile.date_of_birth), 'PPP')}
                          </span>
                        </div>
                      )}
                      {profile.country && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.country}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.address && (
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">Street Address</p>
                        <p className="text-muted-foreground">{profile.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.city && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">City</p>
                          <p className="text-muted-foreground">{profile.city}</p>
                        </div>
                      </div>
                    )}
                    {profile.state && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">State</p>
                          <p className="text-muted-foreground">{profile.state}</p>
                        </div>
                      </div>
                    )}
                    {profile.pincode && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Pincode</p>
                          <p className="text-muted-foreground">{profile.pincode}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="text-sm">
                      {format(new Date(profile.created_at), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Account status</p>
                    <p className="text-sm">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
