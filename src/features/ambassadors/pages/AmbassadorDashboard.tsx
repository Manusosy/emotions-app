import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Users, BookOpen, BarChart3, MessageSquare, BellRing, CheckCircle2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AmbassadorMetricsProps {
  totalStats: {
    appointments: number;
    patients: number;
    groups: number;
  };
}

const AmbassadorMetrics: React.FC<AmbassadorMetricsProps> = ({ totalStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          <CalendarClock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStats.appointments}</div>
          <p className="text-xs text-gray-500">All time appointments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStats.patients}</div>
          <p className="text-xs text-gray-500">Unique patients</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          <BookOpen className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStats.groups}</div>
          <p className="text-xs text-gray-500">Managed groups</p>
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
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">
          Welcome, {profileData?.full_name || "Ambassador"}!
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div>
          <p className="text-sm text-gray-500">
            Here's a snapshot of your dashboard. Manage appointments, groups, and
            resources efficiently.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refreshData}>
            <BellRing className="w-4 h-4 mr-2" /> Refresh Data
          </Button>
        </div>
        <div className="flex justify-center items-center">
          {profileData?.profile_picture ? (
            <img
              src={profileData.profile_picture}
              alt="Profile"
              className="rounded-full w-24 h-24 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-500" />
            </div>
          )}
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
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <ul className="list-none space-y-2">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {appointment.patient_profiles?.full_name || "Patient Name"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(appointment.date), "MMM d, yyyy")} at {appointment.time}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No upcoming appointments scheduled.</p>
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
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Managed Groups</CardTitle>
      </CardHeader>
      <CardContent>
        {groups.length > 0 ? (
          <ul className="list-none space-y-2">
            {groups.map((group) => (
              <li key={group.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.description}</p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No managed groups available.</p>
        )}
      </CardContent>
    </Card>
  );
};

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
  });
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    console.log("AmbassadorDashboard component mounted");
    
    return () => {
      isMountedRef.current = false;
      console.log("AmbassadorDashboard component unmounted");
    };
  }, []);

  // Fetch profile data when the dashboard loads
  useEffect(() => {
    if (!user?.id || !isMountedRef.current) return;
    
    console.log("Fetching ambassador profile data");
    
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

  // Fetch dashboard data
  useEffect(() => {
    if (!user?.id || !isMountedRef.current) return;
    
    console.log("Loading ambassador dashboard data");
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        console.log("Fetching appointments for user:", user.id);
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*, patient_profiles:patient_id(*)")
          .eq("ambassador_id", user.id)
          .gte("date", new Date().toISOString())
          .order("date", { ascending: true })
          .limit(5);

        if (appointmentsError) {
          console.error("Error loading appointments:", appointmentsError);
        } else {
          console.log("Appointments loaded:", appointmentsData?.length || 0);
          if (isMountedRef.current) {
            setUpcomingAppointments(appointmentsData || []);
          }
        }

        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .eq("ambassador_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);

        if (groupsError) {
          console.error("Error loading groups:", groupsError);
        } else {
          console.log("Groups loaded:", groupsData?.length || 0);
          if (isMountedRef.current) {
            setManagedGroups(groupsData || []);
          }
        }
        
        // Get total stats 
        const { data: statsData, error: statsError } = await supabase
          .from("ambassador_stats")
          .select("*")
          .eq("ambassador_id", user.id)
          .single();
          
        if (!statsError && statsData && isMountedRef.current) {
          console.log("Ambassador stats loaded");
          setTotalStats({
            appointments: statsData.total_appointments || 0,
            patients: statsData.total_patients || 0,
            groups: statsData.total_groups || 0
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  const refreshData = () => {
    toast.success("Dashboard data refreshed!");
  };

  // Main dashboard content
  return (
    <DashboardLayout>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <Welcome profileData={profileData} refreshData={refreshData} />
          <AmbassadorMetrics totalStats={totalStats} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UpcomingAppointment appointments={upcomingAppointments} />
            <ManagedGroups groups={managedGroups} />
          </div>
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild>
                <Link to="/ambassador-dashboard/appointments" className="flex items-center justify-center">
                  Manage Appointments
                </Link>
              </Button>
              <Button asChild>
                <Link to="/ambassador-dashboard/clients" className="flex items-center justify-center">
                  View Clients
                </Link>
              </Button>
              <Button asChild>
                <Link to="/ambassador-dashboard/groups" className="flex items-center justify-center">
                  Manage Groups
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default AmbassadorDashboard;
