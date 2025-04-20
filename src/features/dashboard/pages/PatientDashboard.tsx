import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Calendar, 
  MessageSquare, 
  Phone, 
  Book, 
  Settings, 
  LogOut,
  User,
  Clock,
  Video,
  UserPlus,
  Users,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  BadgeHelp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import MoodAnalytics from "../components/MoodAnalytics";
import MoodAssessment from "../components/MoodAssessment";
import { Appointment, Message, UserProfile } from "@/types/database.types";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [supportGroups, setSupportGroups] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check local storage for auth data when no session found
        if (!session) {
          const storedAuthState = localStorage.getItem('auth_state');
          if (storedAuthState) {
            try {
              const { isAuthenticated, userRole } = JSON.parse(storedAuthState);
              if (!isAuthenticated || userRole !== 'patient') {
                navigate('/login');
                return;
              }
              // Continue with stored auth - we'll use default/mock data
            } catch (e) {
              console.error("Error parsing stored auth state:", e);
              navigate('/login');
              return;
            }
          } else {
            navigate('/login');
            return;
          }
        }

        // Create profile from user metadata or use default data if not available
        const userProfile: UserProfile = {
          id: session?.user?.id || 'unknown',
          patient_id: session?.user?.user_metadata?.patient_id || 'EMHA01P',
          first_name: session?.user?.user_metadata?.first_name || 'Demo',
          last_name: session?.user?.user_metadata?.last_name || 'User',
          email: session?.user?.email || 'demo@example.com',
          phone_number: session?.user?.user_metadata?.phone_number || '',
          date_of_birth: session?.user?.user_metadata?.date_of_birth || '',
          country: session?.user?.user_metadata?.country || 'United States',
          address: session?.user?.user_metadata?.address || '',
          city: session?.user?.user_metadata?.city || '',
          state: session?.user?.user_metadata?.state || '',
          pincode: session?.user?.user_metadata?.pincode || '',
          avatar_url: session?.user?.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString()
        };

        if (isMounted) {
          setProfile(userProfile);
        }

        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", session.user.id)
          .order("date", { ascending: true });

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          // Use mock data instead
          const mockAppointments: Appointment[] = [
            {
              id: "1",
              date: "2023-10-15",
              time: "10:00 AM",
              type: "video",
              status: "upcoming",
              patient_id: session.user.id,
              ambassador_id: "amb-123",
              notes: null,
              duration: "60 minutes"
            },
            {
              id: "2",
              date: "2023-10-20",
              time: "2:30 PM",
              type: "voice",
              status: "upcoming",
              patient_id: session.user.id,
              ambassador_id: "amb-456",
              notes: null,
              duration: "45 minutes"
            }
          ];
          
          if (isMounted) {
            setAppointments(mockAppointments);
          }
        } else {
          // Map the database results to the expected Appointment type
          const mappedAppointments: Appointment[] = appointmentsData.map(appt => ({
            id: appt.id,
            date: appt.date,
            time: appt.time,
            type: appt.type,
            status: appt.status || "pending",
            patient_id: appt.patient_id,
            ambassador_id: appt.ambassador_id,
            notes: appt.notes,
            duration: appt.duration
          }));
          
          if (isMounted) {
            setAppointments(mappedAppointments);
          }
        }
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            unread
          `)
          .eq("recipient_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          // Use mock data instead
          const mockMessages: Message[] = [
            {
              id: "1",
              sender: {
                id: "1",
                full_name: "Sarah Johnson (Ambassador)",
                avatar_url: "/lovable-uploads/47ac3dae-2498-4dd3-a729-73086f5c34f8.png"
              },
              content: "Hi there! Just checking in on how you're feeling after our last session.",
              created_at: new Date().toISOString(),
              timestamp: "10:30 AM",
              unread: true
            },
            {
              id: "2",
              sender: {
                id: "2",
                full_name: "Michael Chen (Ambassador)",
                avatar_url: ""
              },
              content: "Don't forget to complete your daily mood tracking exercise.",
              created_at: new Date().toISOString(),
              timestamp: "Yesterday",
              unread: false
            }
          ];
          
          if (isMounted) {
            setMessages(mockMessages);
          }
        } else {
          // Map the database results to the expected Message type
          const mappedMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            sender: {
              id: "sender-id", // Placeholder since we don't have this data
              full_name: "Support Team" // Placeholder since we don't have this data
            },
            content: msg.content,
            created_at: msg.created_at,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
            unread: msg.unread || false
          }));
          
          if (isMounted) {
            setMessages(mappedMessages);
          }
        }

        // Fetch upcoming appointments
        const { data: upcomingAppointmentsData, error: upcomingAppointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            ambassador_profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('patient_id', session.user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time')
          .limit(5);

        if (upcomingAppointmentsError) {
          console.error("Error fetching upcoming appointments:", upcomingAppointmentsError);
          setUpcomingAppointments([]);
        } else {
          setUpcomingAppointments(upcomingAppointmentsData || []);
        }

        // Fetch support groups
        const { data: supportGroupsData, error: supportGroupsError } = await supabase
          .from('group_members')
          .select(`
            *,
            support_groups (
              id,
              name,
              description,
              group_type,
              meeting_schedule,
              ambassador_profiles (
                full_name
              )
            )
          `)
          .eq('user_id', session.user.id)
          .eq('status', 'active');

        if (supportGroupsError) {
          console.error("Error fetching support groups:", supportGroupsError);
          setSupportGroups([]);
        } else {
          setSupportGroups(supportGroupsData || []);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          toast.error(error.message || "Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from("patient_profiles")
        .update(updatedData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleJournalClick = () => {
    navigate('/journal');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Your Mood Analytics</CardTitle>
          </CardHeader>
          <CardContent>
                  <MoodAnalytics />
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodAssessment onComplete={() => toast.success('Mood logged successfully')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Find an Ambassador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Connect with mental health ambassadors for support and guidance.</p>
            <Button className="w-full" onClick={() => navigate("/ambassadors")}>
              Browse Ambassadors
            </Button>
          </CardContent>
        </Card>

              <Card>
          <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-2 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        with {appointment.ambassador_profiles.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.start_time).toLocaleString()}
                      </p>
                    </div>
                        </div>
                      ))}
                    </div>
                  ) : (
              <p className="text-muted-foreground">No upcoming appointments</p>
            )}
            <Button className="w-full mt-4" variant="outline" onClick={() => window.location.href = '/booking'}>
              Book New Session
                      </Button>
                  </CardContent>
                </Card>

              <Card>
          <CardHeader>
            <CardTitle>Your Support Groups</CardTitle>
                </CardHeader>
                <CardContent>
            {supportGroups.length > 0 ? (
                      <div className="space-y-4">
                {supportGroups.map((membership) => (
                  <div key={membership.id} className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium">{membership.support_groups.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Type: {membership.support_groups.group_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Schedule: {membership.support_groups.meeting_schedule}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Led by: {membership.support_groups.ambassador_profiles.full_name}
                    </p>
          </div>
                        ))}
          </div>
                    ) : (
              <p className="text-muted-foreground">You haven't been added to any support groups yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
            />
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
}
