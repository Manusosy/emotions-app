import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Appointment } from "@/types/database.types"; 
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Video,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { DashboardLayout } from "../components/DashboardLayout";

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

const AmbassadorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
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
  
  const stats = {
    totalClients: 78,
    clientsToday: 12,
    sessionsToday: 8,
    clientIncrease: "15% From Last Week",
    clientTodayIncrease: "20% From Yesterday",
    sessionIncrease: "10% From Yesterday"
  };

  const recentClients = [
    { name: "Adrian Marshall", clientId: "C0001", lastSession: "15 Mar 2025" },
    { name: "Jamie Johnson", clientId: "C0002", lastSession: "13 Mar 2025" }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          date,
          time,
          type,
          status
        `)
        .eq("ambassador_id", user.id)
        .order("date", { ascending: true });

      if (appointmentsError) throw appointmentsError;

      // For now, we'll use mock data for support groups
      const mockSupportGroups: SupportGroup[] = [
        {
          id: "1",
          name: "Anxiety Support",
          description: "Weekly support group for anxiety management",
          schedule: [{ day: "Monday", hours: "6:00 PM - 7:30 PM" }],
          price: 15,
          participants: 8,
          max_participants: 12
        },
        {
          id: "2",
          name: "Depression Support",
          description: "Bi-weekly support for depression management",
          schedule: [{ day: "Thursday", hours: "7:00 PM - 8:30 PM" }],
          price: 20,
          participants: 5,
          max_participants: 10
        }
      ];

      // Transform appointments to match our interface
      const formattedAppointments = (appointmentsData || []).map(appt => ({
        ...appt,
        patient: {
          name: "Patient", // Placeholder since we don't have patient data
          avatar: ""
        }
      }));

      setAppointments(formattedAppointments);
      setSupportGroups(mockSupportGroups);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
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
                  <h3 className="text-3xl font-bold mt-1">{stats.sessionsToday}</h3>
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
                    <BarChart
                      data={appointmentData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar 
                        dataKey="appointments" 
                        fill="#9b87f5" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
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
                  
              {appointments[0] && (
                <>
                  <div className="flex items-center pb-4 border-b border-blue-400/30">
                    <div className="flex-1">
                      <div className="text-blue-200 text-sm">#{appointments[0].id}</div>
                      <div className="text-xl font-medium">{appointments[0].patient.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">{appointments[0].type}</div>
                      <div className="text-blue-200">{appointments[0].date} at {appointments[0].time}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/20">
                      <Video className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Video Session</span>
                    </Button>
                    <Button className="bg-white text-blue-600 hover:bg-gray-100">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Chat Now</span>
                    </Button>
                    <Button className="bg-white text-blue-600 hover:bg-gray-100">
                      Start Session
                    </Button>
                  </div>
                </>
              )}
              
              {!appointments[0] && (
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
