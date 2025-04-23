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
  HeartPulse,
  Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import MoodAnalytics from "../components/MoodAnalytics";
import MoodAssessment from "../components/MoodAssessment";
import MoodSummaryCard from "../components/MoodSummaryCard";
import EmotionalHealthWheel from "../components/EmotionalHealthWheel";
import { Appointment, Message, UserProfile } from "@/types/database.types";
import { format, parseISO } from "date-fns";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Define interfaces for appointment data
interface Ambassador {
  name: string;
  specialization: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  ambassador?: Ambassador;
  notes?: string;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([
    {
      id: 'EMHA01',
      date: '12 Nov 2023',
      time: '10:00 AM',
      type: 'Video Consultation',
      status: 'Upcoming',
      ambassador: {
        name: 'Dr. Sophie Chen',
        specialization: 'Psychiatrist'
      },
      notes: 'Follow-up on medication efficacy'
    },
    {
      id: 'EMHA02',
      date: '18 Nov 2023',
      time: '2:30 PM',
      type: 'Phone Call',
      status: 'Upcoming',
      ambassador: {
        name: 'Michael Roberts',
        specialization: 'Wellness Coach'
      },
      notes: 'Weekly check-in'
    },
    {
      id: 'EMHA03',
      date: '25 Nov 2023',
      time: '11:15 AM',
      type: 'In-person',
      status: 'Upcoming',
      ambassador: {
        name: 'Dr. James Wilson',
        specialization: 'Therapist'
      },
      notes: 'Therapy session'
    },
    {
      id: 'EMHA04',
      date: '30 Nov 2023',
      time: '4:00 PM',
      type: 'Video Consultation',
      status: 'Upcoming',
      ambassador: {
        name: 'Emma Thompson',
        specialization: 'Nutritionist'
      },
      notes: 'Dietary plan review'
    }
  ]);
  const [supportGroups, setSupportGroups] = useState<any[]>([]);
  const [recentJournalEntries, setRecentJournalEntries] = useState<any[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<string>("all");
  const [lastCheckIn, setLastCheckIn] = useState<string>("");
  const [lastCheckInDate, setLastCheckInDate] = useState<string>("");
  const [lastAssessmentDate, setLastAssessmentDate] = useState<string>("");
  const [userMetrics, setUserMetrics] = useState({
    moodScore: 0,
    stressLevel: 0,
    consistency: 0,
    lastCheckInStatus: "No check-ins yet",
    streak: 0,
    firstCheckInDate: ""
  });
  const [hasAssessments, setHasAssessments] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Set last check-in time to current time (for mood tracking)
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCheckIn(timeString);
    
    // For the date display
    const today = new Date();
    setLastCheckInDate(`${today.toLocaleString('default', { month: 'short' })} ${today.getDate()}, ${today.getFullYear()}`);
    
    // Initialize last assessment date to "Not taken" by default
    setLastAssessmentDate("Not taken");

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
          // Fetch stress assessments to check if user has any assessments
          const { data: assessments, error: assessmentsError } = await supabase
            .from('stress_assessments')
            .select('*')
            .eq('user_id', session?.user?.id || 'unknown')
            .order('created_at', { ascending: false });
          
          if (!assessmentsError && assessments && assessments.length > 0) {
            // User has taken assessments
            
            // Get last assessment time from the most recent entry
            const lastAssessment = assessments[0];
            const lastAssessmentDateTime = new Date(lastAssessment.created_at);
            const assessmentTimeString = lastAssessmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const assessmentDateString = `${lastAssessmentDateTime.toLocaleString('default', { month: 'short' })} ${lastAssessmentDateTime.getDate()}, ${lastAssessmentDateTime.getFullYear()}`;
            
            // Get metrics from user_assessment_metrics
            const { data: metricsData } = await supabase
              .from('user_assessment_metrics')
              .select('*')
              .eq('user_id', session?.user?.id || 'unknown')
              .single();
            
            if (isMounted) {
              // Convert stress_level from 0-1 scale to 0-10 scale for display
              const stressLevel = metricsData?.stress_level * 10 || lastAssessment.stress_score || 0;
              
              setUserMetrics({
                moodScore: 0, // Will be filled from mood tracking if available
                stressLevel: stressLevel,
                consistency: metricsData?.consistency || 0,
                lastCheckInStatus: "Active",
                streak: 0,
                firstCheckInDate: ""
              });
              
              setLastAssessmentDate(assessmentDateString);
              setHasAssessments(true);
            }

            // Calculate streak by checking consecutive days with entries
            const dates = assessments.map(a => new Date(a.created_at).toDateString());
            const uniqueDates = [...new Set(dates)].map(d => new Date(d));
            uniqueDates.sort((a, b) => b.getTime() - a.getTime()); // Sort descending
            
            // Get today's date without time
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if the most recent entry is from today
            const mostRecentDate = uniqueDates[0];
            mostRecentDate.setHours(0, 0, 0, 0);
            
            let streak = 0;
            const msInDay = 24 * 60 * 60 * 1000;
            
            if (mostRecentDate.getTime() === today.getTime()) {
              // Start counting streak from today
              streak = 1;
              let prevDate = today;
              
              // Check previous days
              for (let i = 1; i < uniqueDates.length; i++) {
                const currentDate = uniqueDates[i];
                currentDate.setHours(0, 0, 0, 0);
                
                // If the current date is exactly one day before the previous date
                const dayDiff = (prevDate.getTime() - currentDate.getTime()) / msInDay;
                if (dayDiff === 1) {
                  streak++;
                  prevDate = currentDate;
                } else {
                  break; // Streak broken
                }
              }
            }
            
            // Get first check-in date
            const oldestDate = new Date(assessments[assessments.length - 1].created_at);
            const firstCheckInDate = `${oldestDate.toLocaleString('default', { month: 'short' })} ${oldestDate.getDate()}, ${oldestDate.getFullYear()}`;
            
            if (isMounted) {
              setUserMetrics(prevMetrics => ({
                ...prevMetrics,
                streak: streak,
                firstCheckInDate: firstCheckInDate
              }));
            }
          } else {
            // New user with no assessments
            if (isMounted) {
              setUserMetrics({
                moodScore: 0,
                stressLevel: 0,
                consistency: 0,
                lastCheckInStatus: "No check-ins yet",
                streak: 0,
                firstCheckInDate: ""
              });
              setHasAssessments(false);
              setLastAssessmentDate("Not taken");
            }
          }
          
          // Now additionally fetch mood entries (separate from assessments)
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
            
            if (isMounted) {
              setUserMetrics(prevMetrics => ({
                ...prevMetrics,
                moodScore: avgScore,
              }));
              setLastCheckIn(timeString);
              setLastCheckInDate(dateString);
            }
          }
        } catch (error) {
          console.error("Error fetching user metrics:", error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          toast.error(error.message || "Failed to load dashboard data");
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

  const handleExportPDF = () => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(32, 192, 243); // #20C0F3
      doc.text("Upcoming Appointments", 105, 15, { align: 'center' });
      
      // Add patient information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Patient: ${profile?.first_name || 'John'} ${profile?.last_name || 'Doe'}`, 20, 30);
      doc.text(`ID: ${profile?.patient_id || 'P123456'}`, 20, 40);
      doc.text("Date Generated: " + new Date().toLocaleDateString(), 20, 50);
      
      // Create table data
      const tableColumn = ["ID", "Date", "Time", "Type", "Ambassador", "Notes"];
      const tableRows = upcomingAppointments.map(appointment => [
        appointment.id,
        appointment.date,
        appointment.time,
        appointment.type,
        appointment.ambassador ? appointment.ambassador.name : "-",
        appointment.notes || "-"
      ]);
      
      // Add table to document - need to cast to any for autoTable to work
      const autoTable = (doc as any).autoTable;
      if (typeof autoTable === 'function') {
        autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 60,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [220, 220, 220]
          },
          headStyles: {
            fillColor: [32, 192, 243], // #20C0F3
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240]
          }
        });
        
        // Add footer
        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("EmotionHealth - Your Mental Health Partner", 105, finalY, { align: 'center' });
      }
      
      // Save the PDF
      doc.save("Upcoming-Appointments.pdf");
      toast.success("Appointments exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export appointments");
    }
  };

  const handleExportAppointment = (appointmentId: string) => {
    try {
      const appointment = upcomingAppointments.find(app => app.id === appointmentId);
      
      if (!appointment) {
        toast.error("Appointment not found");
        return;
      }
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(32, 192, 243); // #20C0F3
      doc.text("Appointment Details", 105, 15, { align: 'center' });
      
      // Add appointment information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Appointment ID: ${appointment.id}`, 20, 30);
      doc.text(`Date: ${appointment.date}`, 20, 40);
      doc.text(`Time: ${appointment.time}`, 20, 50);
      doc.text(`Type: ${appointment.type}`, 20, 60);
      doc.text(`Status: ${appointment.status}`, 20, 70);
      
      if (appointment.ambassador) {
        doc.text(`Ambassador: ${appointment.ambassador.name}`, 20, 80);
        doc.text(`Specialization: ${appointment.ambassador.specialization}`, 20, 90);
      }
      
      if (appointment.notes) {
        doc.text(`Notes: ${appointment.notes}`, 20, 100);
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("EmotionHealth - Your Mental Health Partner", 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save(`Appointment-${appointmentId}.pdf`);
      toast.success("Appointment details exported successfully");
    } catch (error) {
      console.error("Error exporting appointment PDF:", error);
      toast.error("Failed to export appointment");
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
                  {hasAssessments && userMetrics.stressLevel > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Tracked</span>
                  )}
                </div>
                
                {userMetrics.stressLevel > 0 ? (
                  <>
                    <div className="text-3xl font-bold mb-1">
                      {Math.round(userMetrics.stressLevel * 10)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500 ease-in-out"
                        style={{ 
                          width: `${Math.round(userMetrics.stressLevel * 10)}%`,
                          backgroundColor: userMetrics.stressLevel < 3 ? '#4ade80' : 
                                         userMetrics.stressLevel < 5 ? '#a3e635' : 
                                         userMetrics.stressLevel < 7 ? '#facc15' : 
                                         userMetrics.stressLevel < 8 ? '#fb923c' : '#ef4444'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Based on your recent assessment
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold mb-1">
                      <span className="opacity-70">—</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="h-2 rounded-full bg-gray-300 w-0"></div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Complete your first assessment
                    </p>
                  </>
                )}
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
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      {userMetrics.streak > 0 ? `${userMetrics.streak} day${userMetrics.streak !== 1 ? 's' : ''} streak` : 'Active Streak'}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  {hasAssessments 
                    ? userMetrics.consistency > 0 
                      ? `${Math.round(userMetrics.consistency * 10)}%` 
                      : userMetrics.streak > 0 
                        ? `${userMetrics.streak} day${userMetrics.streak !== 1 ? 's' : ''}` 
                        : <span className="opacity-70 animate-pulse">—</span> 
                    : <span className="opacity-70">—</span>}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {hasAssessments 
                    ? userMetrics.consistency > 0 
                      ? userMetrics.streak > 1 
                        ? `Keep your ${userMetrics.streak}-day streak going!` 
                        : "Keep showing up daily"
                      : <span className="flex items-center"><span className="text-xs inline-block text-emerald-600">Keep showing up daily</span></span>
                    : "Start tracking your mood"}
                  {userMetrics.firstCheckInDate && (
                    <span className="block mt-1 text-slate-400">Since {userMetrics.firstCheckInDate}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mood Check-in and Recent Assessments - 2 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Emotional Health Wheel - replaces Daily Check-in */}
          <EmotionalHealthWheel 
            stressLevel={userMetrics.stressLevel} 
            lastCheckIn={lastAssessmentDate}
            onViewDetails={() => navigate('/patient-dashboard/reports')}
            hasAssessments={hasAssessments}
          />

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
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-1" />
                  Export All
                </Button>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#20C0F3' }} className="rounded-t-lg">
                      <th className="text-left text-sm font-medium text-white p-4 first:rounded-tl-lg">ID</th>
                      <th className="text-left text-sm font-medium text-white p-4">M.H Ambassador</th>
                      <th className="text-left text-sm font-medium text-white p-4">Date</th>
                      <th className="text-left text-sm font-medium text-white p-4">Type</th>
                      <th className="text-left text-sm font-medium text-white p-4 last:rounded-tr-lg">Status</th>
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
                        <div className="flex items-center gap-2">
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium px-3 py-1 rounded-full">
                            <span className="flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                              Upcoming
                            </span>
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleExportAppointment('EMHA01')}
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium px-3 py-1 rounded-full">
                            <span className="flex items-center">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                              Completed
                            </span>
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleExportAppointment('EMHA02')}
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
                        </div>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleExportAppointment('EMHA03')}
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0" 
                            onClick={() => handleExportAppointment('EMHA04')}
                          >
                            <FileText className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-600"
              onClick={() => navigate('/patient-dashboard/journal')}
            >
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              // Loading skeletons for journal entries
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="hover:border-blue-200 cursor-pointer transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : recentJournalEntries.length === 0 ? (
              // No entries message
              <Card className="col-span-full p-5 text-center">
                <CardContent>
                  <p className="text-slate-500 mb-3">No journal entries yet</p>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/patient-dashboard/journal/new')}
                  >
                    Create Your First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Display actual journal entries
              recentJournalEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="hover:border-blue-200 cursor-pointer transition-colors"
                  onClick={() => navigate(`/patient-dashboard/journal/${entry.id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={
                        entry.mood === 'Happy' || entry.mood === 'Grateful' ? "bg-green-50 border-green-200 text-green-700" :
                        entry.mood === 'Calm' ? "bg-blue-50 border-blue-200 text-blue-700" :
                        entry.mood === 'Anxious' || entry.mood === 'Worried' ? "bg-yellow-50 border-yellow-200 text-yellow-700" :
                        entry.mood === 'Sad' || entry.mood === 'Overwhelmed' ? "bg-red-50 border-red-200 text-red-700" :
                        "bg-slate-50 border-slate-200 text-slate-700"
                      }>
                        {entry.mood || 'Neutral'}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2 line-clamp-1">{entry.title || 'Untitled Entry'}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {entry.content ? entry.content.replace(/<[^>]*>/g, '') : 'No content'}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
