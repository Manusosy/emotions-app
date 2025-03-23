import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Video, 
  Plus, 
  Star, 
  CheckCircle2,
  LayoutDashboard,
  AlertCircle,
  Bell,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Appointment } from "@/types/database.types"; 
import { useMediaQuery } from "@/hooks/use-media-query";
import { AmbassadorOnboardingDialog } from "../components/AmbassadorOnboardingDialog";
import { ClientCard } from "../components/ClientCard";
import { AppointmentCard } from "../components/AppointmentCard";
import { GroupCard } from "../components/GroupCard";
import { DashboardAppointment } from "@/types/ambassadors.types";
import { Group } from "@/types/groups";
import { User } from "@/types/user";
import { OnboardingDialog } from "../components/OnboardingDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

interface DashboardAppointment {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  patient: {
    name: string;
    avatar: string;
  };
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  schedule: Array<{
    day: string;
    hours: string;
  }>;
  price: number;
  participants: number;
  max_participants: number;
}

interface AmbassadorDashboardProps {
  refreshData?: () => Promise<any>;
}

const AmbassadorDashboard = ({ refreshData }: AmbassadorDashboardProps) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);
  const [profileData, setProfileData] = useState(null);
  const [recentClients, setRecentClients] = useState([
    { name: "Adrian Marshall", clientId: "C0001", lastSession: "15 Mar 2025" },
    { name: "Jamie Johnson", clientId: "C0002", lastSession: "13 Mar 2025" }
  ]);
  
  const revenueData = [
    { name: 'Mon', amount: 1200 },
    { name: 'Tue', amount: 1800 },
    { name: 'Wed', amount: 1000 },
    { name: 'Thu', amount: 1500 },
    { name: 'Fri', amount: 2000 },
    { name: 'Sat', amount: 2400 },
    { name: 'Sun', amount: 1700 },
  ];

  const appointmentData = [
    { name: 'Mon', appointments: 4 },
    { name: 'Tue', appointments: 7 },
    { name: 'Wed', appointments: 3 },
    { name: 'Thu', appointments: 5 },
    { name: 'Fri', appointments: 6 },
    { name: 'Sat', appointments: 8 },
    { name: 'Sun', appointments: 4 },
  ];
  
  const [stats, setStats] = useState({
    totalClients: "48",
    clientIncrease: "12% This Month",
    clientsToday: "5",
    clientTodayIncrease: "20% From Yesterday",
    totalSessions: "128",
    sessionIncrease: "10% From Yesterday"
  });

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (user?.id) {
        try {
          const { data: profile, error } = await supabase
            .from('ambassador_profiles')
            .select('bio, speciality')
            .eq('id', user.id)
            .single();
            
          const userMetadata = user.user_metadata || {};
          
          if ((error || !profile?.bio || !profile?.speciality) && !userMetadata.has_completed_profile) {
            setShowOnboarding(true);
          }
        } catch (error) {
          console.error("Error checking profile completion:", error);
        }
      }
    };
    
    checkProfileCompletion();
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (refreshData) {
          const profile = await refreshData();
          setProfileData(profile);
        }
        
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*, patient_profiles:patient_id(*)")
          .eq("ambassador_id", user?.id)
          .gte("date", new Date().toISOString())
          .order("date", { ascending: true })
          .limit(5);

        if (appointmentsError) {
          console.error("Error loading appointments:", appointmentsError);
        } else {
          setUpcomingAppointments(appointmentsData || []);
        }

        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .eq("ambassador_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (groupsError) {
          console.error("Error loading groups:", groupsError);
        } else {
          setManagedGroups(groupsData || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user, refreshData]);

  return (
    <DashboardLayout>
      {showOnboarding && <OnboardingDialog />}
      
      <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalClients}</h3>
                  <p className="text-xs text-green-500 mt-1">
                    <span className="inline-block mr-1">↑</span> {stats.clientIncrease}
                  </p>
                </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Clients Today</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.clientsToday}</h3>
                  <p className="text-xs text-green-500 mt-1">
                    <span className="inline-block mr-1">↑</span> {stats.clientTodayIncrease}
                  </p>
                </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Sessions Today</p>
                  <h3 className="text-3xl font-bold mt-1">{stats.totalSessions}</h3>
                  <p className="text-xs text-green-500 mt-1">
                    <span className="inline-block mr-1">↑</span> {stats.sessionIncrease}
                  </p>
                </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 overflow-hidden">
                <div className="p-4 border-b bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Weekly Revenue <span className="text-gray-500 text-sm font-normal">Mar 14 - Mar 21, 2025</span></h3>
                  </div>
                  <div className="flex mt-3 space-x-2">
                <button className="text-sm px-3 py-1 rounded-md bg-blue-100 text-blue-500 font-medium">Weekly</button>
                    <button className="text-sm px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">Monthly</button>
                  </div>
                </div>
                
            <div className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4B7BF5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#4B7BF5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#4B7BF5" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
          <Card className="lg:col-span-4">
                <div className="p-4 border-b bg-white">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Weekly Sessions <span className="text-gray-500 text-sm font-normal">Mar 14 - Mar 21, 2025</span></h3>
                  </div>
                  <div className="flex mt-3 space-x-2">
                <button className="text-sm px-3 py-1 rounded-md bg-blue-100 text-blue-500 font-medium">Weekly</button>
                    <button className="text-sm px-3 py-1 rounded-md text-gray-500 hover:bg-gray-100">Monthly</button>
                  </div>
                </div>
                
            <div className="p-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={appointmentData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stroke="#9b87f5" 
                        fillOpacity={1} 
                        fill="url(#colorAppointments)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
        </div>
              
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <Card className="lg:col-span-8">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Recent Clients</h3>
              <Link to="/ambassador-dashboard/clients" className="text-sm text-blue-500">View All</Link>
                </div>
                
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentClients.map((client, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex space-x-4">
                    <div className="w-12 h-12 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{client.name}</h4>
                          <p className="text-xs text-gray-500">Client ID: {client.clientId}</p>
                          <p className="text-xs text-gray-500 mt-2">Last Session</p>
                          <p className="text-xs">{client.lastSession}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            
          <Card className="lg:col-span-4">
                <div className="bg-[#0078FF] text-white p-5 rounded-t-lg">
                  <h3 className="font-semibold text-xl mb-4">Upcoming Appointment</h3>
                  
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex flex-col p-4 bg-white rounded-lg text-gray-800">
                      <p className="font-medium">{appointment.title || "Meeting"}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.patient_profiles?.first_name 
                          ? `with ${appointment.patient_profiles.first_name} ${appointment.patient_profiles.last_name || ''}`
                          : appointment.client_name || "Client"}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(appointment.start_time || appointment.date).toLocaleString()}
                      </p>
                      {appointment.meeting_link && (
                        <Button size="sm" variant="default" className="mt-2 w-full" onClick={() => window.open(appointment.meeting_link, '_blank')}>
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-blue-200">
                  No upcoming appointments
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AmbassadorDashboard;
