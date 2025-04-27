import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  BarChart3, 
  MessageSquare, 
  ChevronRight,
  User,
  Clock,
  Video
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Define the structure for statistics cards
interface StatCard {
  title: string;
  value: number | string;
  trend?: string;
  icon: React.ReactNode;
}

// Define appointment interface
interface Appointment {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  type: 'video' | 'in-person' | 'chat';
  status: 'upcoming' | 'canceled' | 'completed';
}

const NewAmbassadorDashboard = () => {
  const { user, getFullName } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: "Total Patients",
      value: 28,
      trend: "+12%",
      icon: <Users className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Upcoming Appointments",
      value: 12,
      icon: <Calendar className="h-5 w-5 text-purple-500" />
    },
    {
      title: "Support Groups",
      value: 3,
      icon: <Users className="h-5 w-5 text-amber-500" />
    },
    {
      title: "Patient Satisfaction",
      value: "92%",
      trend: "+5%",
      icon: <BarChart3 className="h-5 w-5 text-green-500" />
    }
  ]);
  
  // Mock calendar data
  const currentMonth = "April 2025";
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Sample calendar data for the current month
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);
  
  // Mock appointment data
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patient_name: 'Emma Thompson',
          date: '2025-04-30',
          time: '10:00 AM',
          type: 'video',
          status: 'upcoming'
        },
        {
          id: '2',
          patient_name: 'James Wilson',
          date: '2025-05-02',
          time: '2:30 PM',
          type: 'in-person',
          status: 'upcoming'
        },
        {
          id: '3',
          patient_name: 'Sophia Garcia',
          date: '2025-05-03',
          time: '11:15 AM',
          type: 'video',
          status: 'upcoming'
        },
        {
          id: '4',
          patient_name: 'Olivia Miller',
          date: '2025-04-27',
          time: '3:00 PM',
          type: 'chat',
          status: 'upcoming'
        }
      ];
      
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Helper function to determine badge color based on appointment type
  const getAppointmentBadge = (type: string) => {
    switch(type) {
      case 'video':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Video className="h-3 w-3 mr-1" />
            Video
          </Badge>
        );
      case 'in-person':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <User className="h-3 w-3 mr-1" />
            In-Person
          </Badge>
        );
      case 'chat':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Helper function to determine if a day has appointments
  const hasDayAppointment = (day: number) => {
    // Check if there's an appointment for this day in the current month
    return appointments.some(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day && aptDate.getMonth() === new Date().getMonth();
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    {stat.trend && (
                      <span className="text-xs font-medium text-emerald-600 mt-1 block">{stat.trend}</span>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upcoming Appointments */}
          <Card className="col-span-1 lg:col-span-2 bg-white border shadow-sm overflow-hidden">
            <CardHeader className="p-3 md:p-4 bg-white border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600" asChild>
                  <Link to="/ambassador-dashboard/appointments">
                    View Calendar <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1">
                        <div className="h-4 w-2/5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {appointment.patient_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{appointment.patient_name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{appointment.time}</span>
                          <span className="mx-1">•</span>
                          <span>{format(new Date(appointment.date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div>
                        {getAppointmentBadge(appointment.type)}
                      </div>
                      <div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-center">
                    <Button variant="outline" className="w-full text-sm h-8" asChild>
                      <Link to="/ambassador-dashboard/appointments">
                        View all appointments
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-white border shadow-sm overflow-hidden">
            <CardHeader className="p-3 md:p-4 bg-white border-b">
              <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
              <p className="text-sm text-gray-500">{currentMonth}</p>
            </CardHeader>
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day, i) => (
                  <div key={i} className="text-xs text-gray-500 font-medium py-1">
                    {day}
                  </div>
                ))}
                
                {/* Fill in first week with empty cells */}
                {Array(6).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="h-6 w-full"></div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day) => (
                  <div 
                    key={day} 
                    className={`
                      h-6 w-full rounded-sm flex items-center justify-center 
                      ${hasDayAppointment(day) ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'}
                      ${day === 26 ? 'bg-blue-600 text-white font-medium' : ''}
                    `}
                  >
                    <span className="text-xs">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities Section */}
        <Card className="bg-white border shadow-sm overflow-hidden">
          <CardHeader className="p-3 md:p-4 bg-white border-b">
            <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Emma Thompson sent you a message</h4>
                  <p className="text-xs text-gray-500">Today, 9:30 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Appointment with James Wilson completed</h4>
                  <p className="text-xs text-gray-500">Yesterday, 2:30 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">New member joined Anxiety Support group</h4>
                  <p className="text-xs text-gray-500">Yesterday, 11:29 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Profile review completed - 95% complete</h4>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Sophia Garcia requested appointment reschedule</h4>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewAmbassadorDashboard; 