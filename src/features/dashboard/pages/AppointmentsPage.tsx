import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Phone, 
  MessageSquare, 
  Filter, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone as PhoneIcon,
  CalendarClock,
  Star,
  Calendar,
  Info,
  FilterIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, addDays, parse, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment } from "@/types/database.types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Ambassador profiles for quick booking
const ambassadorProfiles = [
  {
    id: "amb-123",
    name: "Dr. Edalin Thomans",
    specialty: "Mental Health Counselor",
    avatar: "/assets/doctor-1.jpg",
    email: "edalin@example.com",
    phone: "+1 504 368 6874",
    rating: 4.9,
    reviews: 127,
    available: true,
    nextAvailable: "Today at 2:30 PM",
    specializations: ["Anxiety", "Depression", "Stress Management"],
    education: "PhD in Clinical Psychology, Harvard University",
    about: "Dr. Edalin is a licensed mental health counselor with over 10 years of experience helping individuals overcome emotional challenges."
  },
  {
    id: "amb-456",
    name: "Dr. Shanta Williams",
    specialty: "Emotional Wellness Coach",
    avatar: "/assets/doctor-2.jpg",
    email: "shanta@example.com",
    phone: "+1 832 891 8403",
    rating: 4.8,
    reviews: 93,
    available: true,
    nextAvailable: "Tomorrow at 10:15 AM",
    specializations: ["Trauma Recovery", "Relationship Issues", "Self-Esteem"],
    education: "MSc in Counseling Psychology, Stanford University",
    about: "Dr. Shanta specializes in helping individuals develop emotional resilience and navigate life transitions with confidence."
  }
];

// Mock data for doctors since the original data doesn't include complete doctor info
const doctorProfiles = [
  {
    id: "amb-123",
    name: "Dr. Edalin",
    specialty: "Dentist",
    avatar: "/assets/doctor-1.jpg",
    email: "edalin@example.com",
    phone: "+1 504 368 6874"
  },
  {
    id: "amb-456",
    name: "Dr. Shanta",
    specialty: "Cardiologist",
    avatar: "/assets/doctor-2.jpg",
    email: "shanta@example.com",
    phone: "+1 832 891 8403"
  },
  {
    id: "amb-789",
    name: "Dr. John",
    specialty: "Psychiatrist",
    avatar: "/assets/doctor-3.jpg",
    email: "john@example.com",
    phone: "+1 749 104 6291"
  }
];

type AppointmentWithDoctor = Appointment & {
  doctor?: {
    name: string;
    specialty: string;
    avatar: string;
    email: string;
    phone: string;
  }
}

type DateFilter = {
  label: string;
  startDate: Date;
  endDate: Date;
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Current date
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(addDays(today, 6));
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Appointment counts
  const [counts, setCounts] = useState({
    upcoming: 0,
    cancelled: 0,
    completed: 0
  });

  // Date filter options
  const dateFilters: DateFilter[] = [
    {
      label: "Today",
      startDate: today,
      endDate: today
    },
    {
      label: "Yesterday",
      startDate: subDays(today, 1),
      endDate: subDays(today, 1)
    },
    {
      label: "Last 7 Days",
      startDate: subDays(today, 7),
      endDate: today
    },
    {
      label: "Last 30 Days",
      startDate: subDays(today, 30),
      endDate: today
    },
    {
      label: "This Month",
      startDate: startOfMonth(today),
      endDate: endOfMonth(today)
    },
    {
      label: "Last Month",
      startDate: startOfMonth(subMonths(today, 1)),
      endDate: endOfMonth(subMonths(today, 1))
    }
  ];

  useEffect(() => {
    fetchAppointments();
  }, [user?.id, activeTab, startDate, endDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        return;
      }
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;

      // Convert database appointments to our Appointment interface and add mock doctor data
      const mappedAppointments: AppointmentWithDoctor[] = data.map(appt => {
        // Find a doctor profile based on ambassador_id
        const doctorProfile = doctorProfiles.find(d => d.id === appt.ambassador_id) || 
          doctorProfiles[Math.floor(Math.random() * doctorProfiles.length)];
        
        return {
          id: appt.id,
          date: appt.date,
          time: appt.time,
          type: appt.type || (Math.random() > 0.5 ? "video" : "audio"),
          status: appt.status || (Math.random() > 0.7 ? "completed" : Math.random() > 0.5 ? "cancelled" : "upcoming"),
          patient_id: appt.patient_id,
          ambassador_id: appt.ambassador_id,
          notes: appt.notes,
          duration: appt.duration || "30 minutes",
          doctor: doctorProfile
        };
      });

      // Only add mock data if enabled (for development only)
      const shouldAddMockData = false;
      if (shouldAddMockData && mappedAppointments.length < 3) {
        const mockAppointments: AppointmentWithDoctor[] = [
          {
            id: "apt0001",
            date: "2024-11-11",
            time: "10:45 AM",
            type: "video",
            status: "upcoming",
            patient_id: user.id,
            ambassador_id: "amb-123",
            notes: null,
            duration: "30 minutes",
            doctor: doctorProfiles[0]
          },
          {
            id: "apt0002",
            date: "2024-11-05",
            time: "11:50 AM",
            type: "audio",
            status: "upcoming",
            patient_id: user.id,
            ambassador_id: "amb-456",
            notes: null,
            duration: "45 minutes",
            doctor: doctorProfiles[1]
          },
          {
            id: "apt0003",
            date: "2024-10-27",
            time: "09:30 AM",
            type: "video",
            status: "upcoming",
            patient_id: user.id,
            ambassador_id: "amb-789",
            notes: null,
            duration: "30 minutes",
            doctor: doctorProfiles[2]
          }
        ];
        
        mappedAppointments.push(...mockAppointments);
      }

      const filteredData = mappedAppointments.filter((appointment) => {
        return appointment.status === activeTab;
      });

      setAppointments(filteredData);
      
      // Update counts with actual numbers
      setCounts({
        upcoming: mappedAppointments.filter(a => a.status === "upcoming").length,
        cancelled: mappedAppointments.filter(a => a.status === "cancelled").length,
        completed: mappedAppointments.filter(a => a.status === "completed").length
      });
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentIdCode = (id: string) => {
    return `#Apt${id.substring(0, 4)}`;
  };

  const handleApplyDateFilter = (filter: DateFilter) => {
    setStartDate(filter.startDate);
    setEndDate(filter.endDate);
    setDateFilterOpen(false);
  };

  const handleCustomDateRange = () => {
    // This would open a date range picker
    toast.info("Custom date range picker will be implemented soon");
    setDateFilterOpen(false);
  };

  const handleBookWithAmbassador = (ambassadorId: string) => {
    navigate(`/patient-dashboard/book-appointment?ambassador=${ambassadorId}`);
  };

  const handleViewAmbassadorProfile = (ambassadorId: string) => {
    // This would navigate to the ambassador profile page
    toast.info("Viewing ambassador profile will be implemented soon");
    // navigate(`/patient-dashboard/ambassador/${ambassadorId}`);
  };

  // Render the appointment list based on the active tab
  const renderAppointmentList = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-48 mt-2" />
                    </div>
                    <div className="space-y-2 hidden md:block">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-0">
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-50 rounded-full p-4 mb-4">
                <CalendarClock className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No {activeTab} appointments</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {activeTab === "upcoming" 
                  ? "You don't have any upcoming appointments scheduled. Book your next appointment to take care of your health."
                  : activeTab === "cancelled" 
                  ? "You don't have any cancelled appointments."
                  : "You don't have any completed appointments yet."}
              </p>
              <Button 
                onClick={() => navigate("/patient-dashboard/book-appointment")}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                Book New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-5">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden border-0 shadow-md">
            <CardContent className="p-0">
              <div className="border-l-4 border-blue-600">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Doctor info */}
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-16 w-16 rounded-full border-2 border-blue-100">
                        <AvatarImage src={appointment.doctor?.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                          {appointment.doctor?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-blue-600 text-sm font-medium">
                            {getAppointmentIdCode(appointment.id)}
                          </p>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {appointment.doctor?.name}
                        </h3>
                        <p className="text-sm text-slate-500">{appointment.doctor?.specialty}</p>
                      </div>
                    </div>

                    {/* Appointment details */}
                    <div className="flex flex-col md:flex-row gap-6 md:ml-auto">
                      {/* Date and type */}
                      <div className="flex flex-col mt-4 md:mt-0">
                        <div className="flex items-center gap-2 text-slate-600 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <p className="text-base font-medium">
                            {format(new Date(appointment.date), "dd MMM yyyy")} • {appointment.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal">General Visit</Badge>
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal flex items-center gap-1">
                            {appointment.type === "video" ? (
                              <>
                                <Video className="h-3 w-3" />
                                <span>Video Call</span>
                              </>
                            ) : (
                              <>
                                <Phone className="h-3 w-3" />
                                <span>Audio Call</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* Doctor contact */}
                      <div className="flex flex-col gap-2 md:border-l md:pl-6 mt-4 md:mt-0">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <p className="text-sm text-slate-600">{appointment.doctor?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-blue-500" />
                          <p className="text-sm text-slate-600">{appointment.doctor?.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3 justify-end">
                    {activeTab === "upcoming" && (
                      <>
                        <Button 
                          variant="outline"
                          className="rounded-full"
                          onClick={() => navigate(`/patient-dashboard/messages/${appointment.doctor?.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat Now
                        </Button>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 rounded-full"
                          onClick={() => navigate(`/patient-dashboard/session/${appointment.id}`)}
                        >
                          Attend
                        </Button>
                      </>
                    )}
                    {activeTab === "cancelled" && (
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 rounded-full"
                        onClick={() => navigate("/patient-dashboard/book-appointment")}
                      >
                        Reschedule
                      </Button>
                    )}
                    {activeTab === "completed" && (
                      <>
                        <Button 
                          variant="outline"
                          className="rounded-full"
                          onClick={() => navigate(`/patient-dashboard/feedback/${appointment.id}`)}
                        >
                          Leave Feedback
                        </Button>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 rounded-full"
                          onClick={() => navigate(`/patient-dashboard/book-appointment?doctor=${appointment.doctor?.id}`)}
                        >
                          Book Again
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Helper to render badge based on count
  const renderCountBadge = (count: number) => {
    if (count === 0) return null;
    return <Badge className="ml-1 bg-blue-600 hover:bg-blue-600 text-white">{count}</Badge>;
  };

  const renderAmbassadorProfiles = () => {
    return (
      <div className="space-y-6 mt-8">
        {ambassadorProfiles.map((ambassador) => (
          <div key={ambassador.id} className="flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              <Avatar className="h-12 w-12 rounded-full border border-blue-100">
                <AvatarImage src={ambassador.avatar} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {ambassador.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-base">{ambassador.name}</h4>
                <p className="text-sm text-slate-500">{ambassador.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{ambassador.rating}</span>
                  <span className="text-xs text-slate-500">({ambassador.reviews})</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="rounded-full flex-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleViewAmbassadorProfile(ambassador.id)}
              >
                View Profile
              </Button>
              <Button 
                size="sm"
                className="rounded-full flex-1 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => handleBookWithAmbassador(ambassador.id)}
              >
                Book Now
              </Button>
            </div>
            {ambassador !== ambassadorProfiles[ambassadorProfiles.length - 1] && (
              <hr className="border-gray-100" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-slate-500">
            Manage your healthcare appointments
          </p>
        </div>

        {/* Header tabs and filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-6 pl-0.5">
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-0.5 border-b-2 font-medium text-base",
                activeTab === "upcoming" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
              {counts.upcoming > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.upcoming}
                </span>
              )}
            </button>
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-0.5 border-b-2 font-medium text-base",
                activeTab === "cancelled" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled
              {counts.cancelled > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.cancelled}
                </span>
              )}
            </button>
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-0.5 border-b-2 font-medium text-base",
                activeTab === "completed" 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setActiveTab("completed")}
            >
              Completed
              {counts.completed > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.completed}
                </span>
              )}
            </button>
          </div>

          {/* Date Filter and Book Button */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Date Dropdown */}
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex-1 lg:flex-none justify-between border rounded-md"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>
                    {format(startDate, "MM/dd/yyyy")} - {format(endDate, "MM/dd/yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-56" align="end">
                <div className="bg-white rounded-md shadow-md overflow-hidden">
                  {dateFilters.map((filter, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                      onClick={() => handleApplyDateFilter(filter)}
                    >
                      {filter.label}
                    </button>
                  ))}
                  <hr className="border-gray-100" />
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                    onClick={handleCustomDateRange}
                  >
                    Custom Range
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 w-10 p-2 rounded-md">
                  <FilterIcon className="h-full w-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter By</DropdownMenuItem>
                <DropdownMenuItem>Doctor Name</DropdownMenuItem>
                <DropdownMenuItem>Appointment Type</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Book Appointment Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 rounded-md"
              onClick={() => navigate("/patient-dashboard/book-appointment")}
            >
              Book Appointment
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Appointment List */}
            {renderAppointmentList()}
          </div>

          <div className="lg:col-span-1">
            {/* Ambassador profiles */}
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Available Ambassadors</h3>
                {renderAmbassadorProfiles()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
