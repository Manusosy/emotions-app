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

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        // Create profile from user metadata
        const userProfile: UserProfile = {
          id: session.user.id,
          patient_id: session.user.user_metadata?.patient_id || 'EMHA01P',
          first_name: session.user.user_metadata?.first_name || '',
          last_name: session.user.user_metadata?.last_name || '',
          email: session.user.email || '',
          phone_number: session.user.user_metadata?.phone_number || '',
          date_of_birth: session.user.user_metadata?.date_of_birth || '',
          country: session.user.user_metadata?.country || '',
          address: session.user.user_metadata?.address || '',
          city: session.user.user_metadata?.city || '',
          state: session.user.user_metadata?.state || '',
          pincode: session.user.user_metadata?.pincode || '',
          avatar_url: session.user.user_metadata?.avatar_url || '',
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
              ambassador_id: null,
              notes: null,
              therapist_name: "Dr. Sarah Johnson",
              therapist_specialty: "Depression & Anxiety",
              therapist_avatar: "/lovable-uploads/47ac3dae-2498-4dd3-a729-73086f5c34f8.png",
              duration: "60 minutes"
            },
            {
              id: "2",
              date: "2023-10-20",
              time: "2:30 PM",
              type: "voice",
              status: "upcoming",
              patient_id: session.user.id,
              ambassador_id: null,
              notes: null,
              therapist_name: "Dr. Michael Chen",
              therapist_specialty: "Stress Management",
              therapist_avatar: "",
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
            therapist_name: "Dr. Example", // Placeholder since we don't have this data
            therapist_specialty: "General", // Placeholder since we don't have this data
            therapist_avatar: "", // Placeholder since we don't have this data
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
                full_name: "Dr. Sarah Johnson",
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
                full_name: "Dr. Michael Chen",
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
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  Welcome back,{' '}
                  {isLoading ? (
                    <Skeleton className="h-6 w-32 inline-block" />
                  ) : (
                    profile?.first_name || 'Patient'
                  )}
                </h1>
                <p className="text-sm text-gray-500">
                  Your therapy journey continues
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
                  variant="outline"
                  className="h-[64px] w-full bg-[#fda901] border-2 border-[#fda901] text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                  onClick={() => navigate('/patient-dashboard/appointments')}
                >
                  <Calendar className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Book Session</span>
                    <span className="text-xs opacity-90">Schedule therapy</span>
                  </div>
          </Button>

                <Button
                  variant="outline"
                  className="h-[64px] w-full bg-[#fda901] border-2 border-[#fda901] text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                  onClick={() => navigate('/patient-dashboard/therapists')}
                >
                  <Users className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Therapists</span>
                    <span className="text-xs opacity-90">Find your match</span>
        </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-[64px] w-full bg-[#fda901] border-2 border-[#fda901] text-white hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                  onClick={() => navigate('/ambassadors')}
                >
                  <UserPlus className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Ambassadors</span>
                    <span className="text-xs opacity-90">Mental health guides</span>
              </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-[64px] w-full bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3"
                  onClick={() => navigate('/journal')}
                >
                  <Book className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">Log Mood</span>
                    <span className="text-xs opacity-90">Track your progress</span>
                </div>
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-[#fda901] hover:bg-[#fda901]/10"
                  onClick={() => navigate('/patient-dashboard/messages')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-[#fda901] hover:bg-[#fda901]/10"
                  onClick={() => navigate('/patient-dashboard/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-[#fda901] hover:bg-[#fda901]/10"
                  onClick={() => navigate('/help')}
                >
                  <BadgeHelp className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
              </div>
            </div>

            {/* Mood Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MoodAssessment />
              <Card className="h-full">
                <CardContent className="p-6">
                  <MoodAnalytics />
            </CardContent>
          </Card>
        </div>
        
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/appointments')}
                    className="border-[#fda901] text-[#fda901] hover:bg-[#fda901] hover:text-black transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:border-[#fda901] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src={appointment.therapist_avatar} />
                              <AvatarFallback className="bg-[#fda901] text-black">
                                {appointment.therapist_name[0]}
                              </AvatarFallback>
                            </Avatar>
        <div>
                              <h4 className="font-medium">{appointment.therapist_name}</h4>
                              <p className="text-sm text-gray-500">{appointment.therapist_specialty}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-4 h-4 text-[#fda901]" />
                                <span className="text-sm">
                                  {appointment.date} at {appointment.time}
                                </span>
                              </div>
            </div>
          </div>
              <Button
                            size="sm"
                            className="bg-[#fda901] text-black hover:bg-[#fda901]/90"
                          >
                            Join Session
              </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-[#fda901]" />
                      <h3 className="mt-4 text-lg font-medium">No appointments</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Schedule your first session with a therapist
                      </p>
                      <Button 
                        onClick={() => navigate('/appointments/new')} 
                        className="mt-4 bg-[#fda901] text-black hover:bg-[#fda901]/90"
                      >
                        Book Appointment
                      </Button>
                    </div>
                  )}
                  </CardContent>
                </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Messages</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/messages')}
                    className="border-[#fda901] text-[#fda901] hover:bg-[#fda901] hover:text-black transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:border-[#fda901] transition-colors"
                          >
                            <Avatar>
                              <AvatarImage src={message.sender.avatar_url} />
                              <AvatarFallback className="bg-[#fda901] text-black">
                                {message.sender.full_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{message.sender.full_name}</h4>
                                <span className="text-sm text-gray-500">
                                  {message.timestamp}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{message.content}</p>
                            </div>
                            {message.unread && (
                              <Badge className="bg-[#fda901] text-black">New</Badge>
            )}
          </div>
                        ))}
          </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-[#fda901]" />
                        <h3 className="mt-4 text-lg font-medium">No messages</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Start a conversation with your therapist
                        </p>
                      </div>
                    )}
                  </ScrollArea>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
