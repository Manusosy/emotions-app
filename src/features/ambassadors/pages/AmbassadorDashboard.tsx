import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarClock, 
  Users, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  BellRing, 
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  TrendingUp,
  Activity,
  ChevronRight,
  Brain,
  Sparkles,
  LineChart,
  Star,
  FileText,
  Briefcase,
  PlayCircle,
  Mail,
  UserPlus
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AmbassadorMetricsProps {
  totalStats: {
    appointments: number;
    patients: number;
    groups: number;
    completionRate?: number;
  };
}

const AmbassadorMetrics: React.FC<AmbassadorMetricsProps> = ({ totalStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700">Total Appointments</CardTitle>
          <div className="h-8 w-8 rounded-full bg-indigo-100 p-1.5 flex items-center justify-center">
            <CalendarClock className="h-5 w-5 text-indigo-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-900">{totalStats.appointments}</div>
          <p className="text-xs text-indigo-600 mt-1">All time appointments</p>
          <div className="mt-3">
            <Progress value={85} className="h-1 bg-indigo-100" indicatorClassName="bg-indigo-600" />
            <p className="text-xs text-indigo-600 mt-1">85% completion rate</p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Active Clients</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 p-1.5 flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-purple-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{totalStats.patients}</div>
          <p className="text-xs text-purple-600 mt-1">Unique clients</p>
          <div className="mt-3">
            <Progress value={totalStats.patients > 10 ? 100 : totalStats.patients * 10} className="h-1 bg-purple-100" indicatorClassName="bg-purple-600" />
            <p className="text-xs text-purple-600 mt-1">
              {totalStats.patients > 0 ? '+2 new this week' : 'No clients yet'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-violet-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-violet-700">Support Groups</CardTitle>
          <div className="h-8 w-8 rounded-full bg-violet-100 p-1.5 flex items-center justify-center">
            <Users className="h-5 w-5 text-violet-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-violet-900">{totalStats.groups}</div>
          <p className="text-xs text-violet-600 mt-1">Active groups</p>
          <div className="mt-3">
            <Progress value={totalStats.groups > 5 ? 100 : totalStats.groups * 20} className="h-1 bg-violet-100" indicatorClassName="bg-violet-600" />
            <p className="text-xs text-violet-600 mt-1">
              {totalStats.groups > 0 ? 'Next session today' : 'No groups scheduled'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-fuchsia-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-fuchsia-700">Satisfaction</CardTitle>
          <div className="h-8 w-8 rounded-full bg-fuchsia-100 p-1.5 flex items-center justify-center">
            <Star className="h-5 w-5 text-fuchsia-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-fuchsia-900">4.8<span className="text-base">/5</span></div>
          <p className="text-xs text-fuchsia-600 mt-1">Client rating</p>
          <div className="mt-3">
            <Progress value={96} className="h-1 bg-fuchsia-100" indicatorClassName="bg-fuchsia-600" />
            <p className="text-xs text-fuchsia-600 mt-1">
              Based on {totalStats.appointments} sessions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface WelcomeProps {
  profileData: any;
  refreshData: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ profileData, refreshData }) => {
  const firstName = profileData?.first_name || profileData?.full_name?.split(' ')[0] || "Ambassador";
  
  return (
    <Card className="col-span-2 overflow-hidden border-none shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-white">
          Welcome back, {firstName}!
        </CardTitle>
        <CardDescription className="text-white/80">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-white/90">
            Here's your dashboard overview. You have upcoming appointments and new client messages waiting for your response.
          </p>
          <div className="flex gap-3 mt-6">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/20" onClick={refreshData}>
              <BellRing className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button className="bg-white text-indigo-700 hover:bg-white/90" asChild>
              <Link to="/ambassador-dashboard/appointments">
                <Calendar className="w-4 h-4 mr-2" /> Appointments
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20 border-2 border-white/25">
            <AvatarImage src={profileData?.avatar_url || profileData?.profile_picture} />
            <AvatarFallback className="bg-white/10 text-white text-xl font-bold">
              {firstName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mt-3 flex flex-col items-center">
            <Badge className="bg-white/20 text-white hover:bg-white/30">Mental Health Ambassador</Badge>
            <p className="text-sm mt-2 text-white/80">
              {profileData?.specialization || "Mental Health Professional"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface UpcomingAppointmentProps {
  appointments: any[];
}

const UpcomingAppointment: React.FC<UpcomingAppointmentProps> = ({ appointments }) => {
  return (
    <Card className="col-span-1 overflow-hidden border-none shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-indigo-800">Upcoming Appointments</CardTitle>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800 p-0" asChild>
            <Link to="/ambassador-dashboard/appointments">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {appointments.slice(0, 4).map((appointment) => (
              <li key={appointment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {(appointment.patient_profiles?.full_name?.charAt(0) || "P")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.patient_profiles?.full_name || "Patient"}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                        {format(new Date(appointment.date), "MMM d, yyyy")}
                        <Clock className="h-3.5 w-3.5 ml-3 mr-1 text-indigo-500" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }>
                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Badge>
                </div>
                {appointment.notes && (
                  <p className="text-xs text-gray-500 mt-2 ml-12">
                    {appointment.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <CalendarClock className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 text-center">No upcoming appointments scheduled.</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/ambassador-dashboard/appointments">
                Schedule Appointment
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ManagedGroupsProps {
  groups: any[];
}

const ManagedGroups: React.FC<ManagedGroupsProps> = ({ groups }) => {
  return (
    <Card className="col-span-1 overflow-hidden border-none shadow-md">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-purple-800">Managed Groups</CardTitle>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 p-0" asChild>
            <Link to="/ambassador-dashboard/groups">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {groups.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {groups.slice(0, 4).map((group) => (
              <li key={group.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{group.name}</p>
                      <Badge className="bg-purple-100 text-purple-800">
                        {group.members || 0} members
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-purple-500" />
                      {group.next_session ? 
                        format(new Date(group.next_session), "MMM d, yyyy") : 
                        "No upcoming sessions"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4">
            <Users className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 text-center">No managed groups available.</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/ambassador-dashboard/groups">
                Create Group
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// New component for quick actions
const QuickActions = () => {
  return (
    <Card className="col-span-2 border-none shadow-md overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
        <CardTitle className="text-sm font-medium text-gray-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col h-24 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700" asChild>
            <Link to="/ambassador-dashboard/appointments/new">
              <UserPlus className="h-6 w-6 mb-2 text-indigo-600" />
              <span>New Client</span>
            </Link>
          </Button>
          <Button variant="outline" className="flex flex-col h-24 border-purple-200 hover:bg-purple-50 hover:text-purple-700" asChild>
            <Link to="/ambassador-dashboard/messages">
              <Mail className="h-6 w-6 mb-2 text-purple-600" />
              <span>Messages</span>
            </Link>
          </Button>
          <Button variant="outline" className="flex flex-col h-24 border-violet-200 hover:bg-violet-50 hover:text-violet-700" asChild>
            <Link to="/ambassador-dashboard/resources">
              <Briefcase className="h-6 w-6 mb-2 text-violet-600" />
              <span>Resources</span>
            </Link>
          </Button>
          <Button variant="outline" className="flex flex-col h-24 border-fuchsia-200 hover:bg-fuchsia-50 hover:text-fuchsia-700" asChild>
            <Link to="/ambassador-dashboard/analytics">
              <BarChart3 className="h-6 w-6 mb-2 text-fuchsia-600" />
              <span>Analytics</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// The main dashboard component with updated loading state
const AmbassadorDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [totalStats, setTotalStats] = useState({
    appointments: 0,
    patients: 0,
    groups: 0,
    completionRate: 85,
  });
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch profile data when the dashboard loads
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (!user?.id) {
      return;
    }
    
    const getProfile = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("ambassador_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          console.log("Ambassador profile loaded");
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching ambassador profile:", error);
        toast.error("Failed to load your profile information");
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    getProfile();
  }, [user]);

  // Handle dashboard data loading
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (!user?.id) {
      return;
    }
    
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch upcoming appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*, patient_profiles(*)")
        .eq("ambassador_id", user.id)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(5);

      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError);
      } else {
        setUpcomingAppointments(appointmentsData || []);
      }

      // Fetch managed groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("support_groups")
        .select("*")
        .eq("ambassador_id", user.id)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
      } else {
        setManagedGroups(groupsData || []);
      }

      // Calculate total stats
      const { count: appointmentsCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact" })
        .eq("ambassador_id", user.id);

      const { count: patientsCount } = await supabase
        .from("appointments")
        .select("patient_id", { count: "exact", head: true })
        .eq("ambassador_id", user.id)
        .is("patient_id", "not.null");

      const { count: groupsCount } = await supabase
        .from("support_groups")
        .select("id", { count: "exact" })
        .eq("ambassador_id", user.id);

      setTotalStats({
        appointments: appointmentsCount || 0,
        patients: patientsCount || 0,
        groups: groupsCount || 0,
        completionRate: 85,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const refreshData = () => {
    toast.info("Refreshing dashboard data...");
    loadData();
  };

  // Loading state with skeleton UI
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse bg-white">
                <CardHeader className="pb-2">
                  <div className="h-5 w-24 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-2 animate-pulse bg-white">
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
                  <div className="h-4 w-full max-w-sm bg-gray-200 rounded"></div>
                </div>
                <div className="h-20 w-20 rounded-full bg-gray-200"></div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="animate-pulse bg-white">
              <CardHeader>
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-12 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-pulse bg-white">
              <CardHeader>
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-12 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Ambassador Dashboard</h2>
        
        <AmbassadorMetrics totalStats={totalStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Welcome profileData={profileData} refreshData={refreshData} />
          <QuickActions />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingAppointment appointments={upcomingAppointments} />
          <ManagedGroups groups={managedGroups} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AmbassadorDashboard;
