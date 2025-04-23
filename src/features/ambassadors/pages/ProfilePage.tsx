import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit,
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Award,
  BookOpen,
  Monitor,
  Languages,
  Star,
  MapPin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AmbassadorProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  speciality: string; 
  languages: string[];
  education: string;
  experience: string;
  availability_status: string;
  avatar_url: string;
  ambassador_id: string;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeClients: 0,
    totalHours: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          return;
        }

        // Fetch ambassador profile from database
        const { data, error } = await supabase
          .from("ambassador_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Handle formatting/processing of data
          const processedProfile = {
            ...data,
            languages: data.languages ? data.languages.split(',') : [],
            speciality: data.speciality || '',
          };
          
          setProfile(processedProfile);
        } else {
          // Create default profile from user metadata
          const userProfile: AmbassadorProfile = {
            id: user.id,
            ambassador_id: user.id,
            full_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
            email: user.email || '',
            phone_number: user.user_metadata?.phone_number || '',
            bio: '',
            speciality: '',
            languages: [],
            education: '',
            experience: '',
            availability_status: 'Available',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
          };

          setProfile(userProfile);
        }

        // Mock stats for now - would normally fetch from database
        setStats({
          totalSessions: 24,
          activeClients: 8,
          totalHours: 42,
          averageRating: 4.8,
        });
    } catch (error: any) {
        console.error('Error fetching profile:', error);
    } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container max-w-5xl py-8 space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Parse specialties from comma-separated string if available
  const specialties = profile?.speciality ? profile.speciality.split(',') : [];

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ambassador Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your ambassador information</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => navigate('/ambassador-dashboard/clients')}
              className="border-blue-200 text-blue-600"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              View Clients
            </Button>
            <Button 
              onClick={() => navigate('/ambassador-dashboard/settings')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {profile ? (
          <div className="space-y-8">
            {/* Basic Info Card */}
            <Card className="overflow-hidden border-none shadow-md rounded-xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-blue-700 text-white text-2xl">
                      {profile.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardContent className="pt-20 pb-6 px-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700 font-medium">
                        Ambassador
                      </Badge>
                      <Badge variant="outline" className={`${
                        profile.availability_status === 'Available' 
                          ? 'bg-green-100 border-green-200 text-green-700' 
                          : 'bg-amber-100 border-amber-200 text-amber-700'
                      } font-medium`}>
                        {profile.availability_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Ambassador since {format(new Date(profile.created_at), 'MMMM yyyy')}
                    </p>
                    {stats.averageRating > 0 && (
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-1 text-sm font-semibold">{stats.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  
                  {profile.phone_number && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{profile.phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics & Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-slate-50 text-center">
                    <p className="text-2xl font-bold text-blue-700">{stats.totalSessions}</p>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 text-center">
                    <p className="text-2xl font-bold text-blue-700">{stats.activeClients}</p>
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 text-center">
                    <p className="text-2xl font-bold text-blue-700">{stats.totalHours}</p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-50 text-center">
                    <p className="text-2xl font-bold text-blue-700">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biography & Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Biography & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.bio && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      Biography
                    </h3>
                    <p className="text-sm text-slate-700">{profile.bio}</p>
                  </div>
                )}

                {specialties.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-blue-600" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty, index) => (
                        <Badge key={index} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                          {specialty.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                      <Languages className="h-4 w-4 mr-2 text-blue-600" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="bg-slate-50">
                          {language.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                      Education
                    </h3>
                    <p className="text-sm text-slate-700">{profile.education}</p>
                  </div>
                )}

                {profile.experience && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 flex items-center">
                      <Monitor className="h-4 w-4 mr-2 text-blue-600" />
                      Professional Experience
                    </h3>
                    <p className="text-sm text-slate-700">{profile.experience}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Profile information not available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
