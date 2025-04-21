import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  BadgeHelp,
  LineChart,
  Heart,
  ExternalLink,
  BookOpen,
  FileText,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart,
  HeartPulse
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import MoodAnalytics from "../components/MoodAnalytics";
import MoodAssessment from "../components/MoodAssessment";
import MoodSummaryCard from "../components/MoodSummaryCard";
import { Appointment, Message, UserProfile } from "@/types/database.types";
import { format, parseISO } from "date-fns";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [supportGroups, setSupportGroups] = useState<any[]>([]);
  const [recentJournalEntries, setRecentJournalEntries] = useState<any[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<string>("all");
  const [lastCheckIn, setLastCheckIn] = useState<string>("");
  const [lastCheckInDate, setLastCheckInDate] = useState<string>("");
  const [userMetrics, setUserMetrics] = useState({
    moodScore: 0,
    stressLevel: 0,
    consistency: 0,
    lastCheckInStatus: "No check-ins yet"
  });
  const [hasAssessments, setHasAssessments] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Set last check-in time to current time
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCheckIn(timeString);
    
    // For the date display
    const today = new Date();
    setLastCheckInDate(`${today.toLocaleString('default', { month: 'short' })} ${today.getDate()}, ${today.getFullYear()}`);

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
              date: "2023-10-15", // These properties are for mock appointments only
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
          ] as any; // Type assertion to avoid properties mismatch
          
          if (isMounted) {
            setAppointments(mockAppointments);
          }
        } else {
          // Map the database results to the expected Appointment type
          const mappedAppointments: Appointment[] = appointmentsData.map(appt => ({
            id: appt.id,
            // Convert database fields to match the expected Appointment type
            date: appt.start_time ? new Date(appt.start_time).toISOString().split('T')[0] : '',
            time: appt.start_time ? new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            type: appt.meeting_link ? 'video' : 'chat',
            status: appt.status || "pending",
            patient_id: appt.patient_id,
            ambassador_id: appt.ambassador_id,
            notes: appt.description || null,
            duration: appt.end_time && appt.start_time ? 
              `${Math.round((new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime()) / 60000)} minutes` 
              : "30 minutes"
          })) as any; // Type assertion to avoid properties mismatch
          
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
        } else if (messagesData) {
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

        // Fetch recent journal entries
        const { data: journalEntriesData, error: journalEntriesError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (journalEntriesError) {
          console.error("Error fetching journal entries:", journalEntriesError);
          setRecentJournalEntries([]);
        } else {
          setRecentJournalEntries(journalEntriesData || []);
        }

        // After fetching appointments and messages, also fetch user metrics
        try {
          // Fetch mood entries to check if user has any assessments
          const { data: moodEntries, error: moodError } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', session?.user?.id || 'unknown')
            .order('created_at', { ascending: false });
          
          if (!moodError && moodEntries && moodEntries.length > 0) {
            // Calculate average mood score
            const totalScore = moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0);
            const avgScore = parseFloat((totalScore / moodEntries.length).toFixed(1));
            
            // Get last check-in time from the most recent entry
            const lastEntry = moodEntries[0];
            const lastEntryDate = new Date(lastEntry.created_at);
            const timeString = lastEntryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = `${lastEntryDate.toLocaleString('default', { month: 'short' })} ${lastEntryDate.getDate()}, ${lastEntryDate.getFullYear()}`;
            
            // Get metrics from user_assessment_metrics
            const { data: metricsData } = await supabase
              .from('user_assessment_metrics')
              .select('*')
              .eq('user_id', session?.user?.id || 'unknown')
              .single();
            
            if (isMounted) {
              setUserMetrics({
                moodScore: avgScore,
                stressLevel: metricsData?.stress_level || 0,
                consistency: metricsData?.consistency || 0,
                lastCheckInStatus: "Active"
              });
              setLastCheckIn(timeString);
              setLastCheckInDate(dateString);
              setHasAssessments(true);
            }
          } else {
            // New user with no assessments
            if (isMounted) {
              setUserMetrics({
                moodScore: 0,
                stressLevel: 0,
                consistency: 0,
                lastCheckInStatus: "No check-ins yet"
              });
              setHasAssessments(false);
              
              // Set current time as placeholder for new users
              const now = new Date();
              const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              setLastCheckIn(timeString);
              
              // For the date display
              const today = new Date();
              setLastCheckInDate(`${today.toLocaleString('default', { month: 'short' })} ${today.getDate()}, ${today.getFullYear()}`);
            }
          }
        } catch (error) {
          console.error("Error fetching user metrics:", error);
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
    navigate('/patient-dashboard/journal');
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
      <div className="space-y-6">
        {/* Title and User Welcome */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-slate-500">
            Welcome back, {profile?.first_name || "User"}
          </p>
        </div>

        {/* Health Records Overview */}
        <div>
          <h2 className="text-xl font-medium mb-4">Emotional Health Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Mood Score */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-red-50 to-pink-50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <HeartPulse className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium">Mood Score</span>
                  </div>
                  {hasAssessments && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Active</span>
                  )}
                </div>
                <div className="text-3xl font-bold">{userMetrics.moodScore.toFixed(1)}</div>
                <p className="text-xs text-slate-500 mt-2">
                  {hasAssessments ? "Average from recent check-ins" : "Start your first check-in"}
                </p>
              </CardContent>
            </Card>

            {/* Stress Level */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Stress Level</span>
                  </div>
                  {hasAssessments && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Tracked</span>
                  )}
                </div>
                <div className="text-3xl font-bold">{userMetrics.stressLevel}%</div>
                <p className="text-xs text-slate-500 mt-2">
                  {hasAssessments ? "From assessment data" : "No data available yet"}
                </p>
              </CardContent>
            </Card>

            {/* Last Check-in */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-indigo-500 mr-2" />
                    <span className="text-sm font-medium">Last Check-in</span>
                  </div>
                </div>
                <div className="text-3xl font-bold">{hasAssessments ? "Today" : "None"}</div>
                <p className="text-xs text-slate-500 mt-2">
                  {hasAssessments ? `${lastCheckIn}, ${lastCheckInDate}` : "Complete your first assessment"}
                </p>
              </CardContent>
            </Card>

            {/* Consistency */}
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <BarChart className="w-5 h-5 text-emerald-500 mr-2" />
                    <span className="text-sm font-medium">Consistency</span>
                  </div>
                  {hasAssessments && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Normal</span>
                  )}
                </div>
                <div className="text-3xl font-bold">{userMetrics.consistency}%</div>
                <p className="text-xs text-slate-500 mt-2">
                  {hasAssessments ? "Daily tracking rate" : "Start tracking your mood"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mood Check-in and Recent Assessments - 2 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Mood Assessment Card */}
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Daily Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodAssessment />
            </CardContent>
          </Card>

          {/* Mood Summary Card */}
          <Card className="h-full bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Recent Trend</CardTitle>
              <CardDescription>Based on recent assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodSummaryCard />
            </CardContent>
          </Card>
        </div>

        {/* Appointment Section */}
        <div>
          {/* Reports Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Appointment Reports</h2>
              <div className="flex items-center mt-2 sm:mt-0 gap-2">
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    defaultValue="all"
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                    value={appointmentFilter}
                  >
                    <option value="all">All Appointments</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left text-sm font-medium text-slate-700 p-4">ID</th>
                      <th className="text-left text-sm font-medium text-slate-700 p-4">M.H Ambassador</th>
                      <th className="text-left text-sm font-medium text-slate-700 p-4">Date</th>
                      <th className="text-left text-sm font-medium text-slate-700 p-4">Type</th>
                      <th className="text-left text-sm font-medium text-slate-700 p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Appointment Row 1 */}
                    {(appointmentFilter === "all" || appointmentFilter === "upcoming") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA01</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Ruby Perrin"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Ruby Perrin</div>
                            <div className="text-xs text-slate-500">Depression & Anxiety Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">25 Apr 2025, 10:30 AM</td>
                      <td className="p-4 text-sm">Video Call</td>
                      <td className="p-4">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium px-3 py-1 rounded-full">
                          <span className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                            Upcoming
                          </span>
                        </Badge>
                      </td>
                    </tr>
                    )}

                    {/* Appointment Row 2 */}
                    {(appointmentFilter === "all" || appointmentFilter === "completed") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA02</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Darren Elder"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Darren Elder</div>
                            <div className="text-xs text-slate-500">Trauma & PTSD Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">18 Apr 2025, 11:40 AM</td>
                      <td className="p-4 text-sm">Video Call</td>
                      <td className="p-4">
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium px-3 py-1 rounded-full">
                          <span className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                            Completed
                          </span>
                        </Badge>
                      </td>
                    </tr>
                    )}

                    {/* Adding Past Appointment: Dr. Deborah Angel */}
                    {(appointmentFilter === "all" || appointmentFilter === "completed") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA03</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1614608997588-8173059e05e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Deborah Angel"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Deborah Angel</div>
                            <div className="text-xs text-slate-500">Relationship & Family Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">12 Apr 2025, 04:00 PM</td>
                      <td className="p-4 text-sm">Chat</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium px-3 py-1 rounded-full">
                            <span className="flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                              Completed
                            </span>
                          </Badge>
                          <div className="flex">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <FileText className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    )}

                    {/* Adding Past Appointment: Dr. Sofia Brient */}
                    {(appointmentFilter === "all" || appointmentFilter === "completed") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA04</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Sofia Brient"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Sofia Brient</div>
                            <div className="text-xs text-slate-500">Addiction & Recovery Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">10 Apr 2025, 10:00 AM</td>
                      <td className="p-4 text-sm">Video Call</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium px-3 py-1 rounded-full">
                            <span className="flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                              Completed
                            </span>
                          </Badge>
                          <div className="flex">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <FileText className="h-3.5 w-3.5 text-slate-600" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    )}

                    {/* Appointment Row 3 */}
                    {(appointmentFilter === "all" || appointmentFilter === "completed") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA05</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Ruby Perrin"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Ruby Perrin</div>
                            <div className="text-xs text-slate-500">Depression & Anxiety Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">02 Apr 2025, 09:20 AM</td>
                      <td className="p-4 text-sm">Audio Call</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 font-medium px-3 py-1 rounded-full">
                          <span className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
                            Completed
                          </span>
                        </Badge>
                      </td>
                    </tr>
                    )}

                    {/* Appointment Row 4 */}
                    {(appointmentFilter === "all" || appointmentFilter === "cancelled") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA06</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Darren Elder"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Darren Elder</div>
                            <div className="text-xs text-slate-500">Trauma & PTSD Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">15 Apr 2025, 04:10 PM</td>
                      <td className="p-4 text-sm">Audio Call</td>
                      <td className="p-4">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 font-medium px-3 py-1 rounded-full">
                          <span className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5"></span>
                            Cancelled
                          </span>
                        </Badge>
                      </td>
                    </tr>
                    )}

                    {/* Appointment Row 5 */}
                    {(appointmentFilter === "all" || appointmentFilter === "upcoming") && (
                    <tr className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <span className="text-blue-600 font-medium">#EMHA07</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                              alt="Sofia Brient"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">Dr. Sofia Brient</div>
                            <div className="text-xs text-slate-500">Addiction & Recovery Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">30 Apr 2025, 06:00 PM</td>
                      <td className="p-4 text-sm">Chat</td>
                      <td className="p-4">
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium px-3 py-1 rounded-full">
                          <span className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                            Upcoming
                          </span>
                        </Badge>
                      </td>
                    </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Journal Entries</h2>
            <Button variant="outline" size="sm" className="text-blue-600">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Journal Entry */}
            <Card className="hover:border-blue-200 cursor-pointer transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    Happy
                  </Badge>
                  <span className="text-xs text-slate-500">Apr 20, 2025</span>
                </div>
                <h3 className="font-medium mb-2 line-clamp-1">Morning Reflection</h3>
                <p className="text-sm text-slate-600 line-clamp-3">
                  Today I woke up feeling refreshed after a good night's sleep. I had a productive morning and managed to complete my daily meditation session...
                </p>
              </CardContent>
            </Card>
            
            {/* Journal Entry */}
            <Card className="hover:border-blue-200 cursor-pointer transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                    Neutral
                  </Badge>
                  <span className="text-xs text-slate-500">Apr 18, 2025</span>
                </div>
                <h3 className="font-medium mb-2 line-clamp-1">Mid-week Thoughts</h3>
                <p className="text-sm text-slate-600 line-clamp-3">
                  Work has been challenging this week, but I'm managing to maintain a good balance. I felt a bit overwhelmed at times but remembered to use my breathing techniques...
                </p>
              </CardContent>
            </Card>
            
            {/* Journal Entry */}
            <Card className="hover:border-blue-200 cursor-pointer transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                    Sad
                  </Badge>
                  <span className="text-xs text-slate-500">Apr 15, 2025</span>
                </div>
                <h3 className="font-medium mb-2 line-clamp-1">Difficult Day</h3>
                <p className="text-sm text-slate-600 line-clamp-3">
                  Today was challenging emotionally. I received some disappointing news and struggled to maintain my focus throughout the day. I'm going to try to rest well tonight...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
