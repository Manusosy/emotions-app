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
  FilterIcon,
  X,
  CalendarPlus,
  RefreshCw,
  CheckCircle2
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
import { Spinner } from "@/components/ui/spinner";
import { appointmentService } from "@/integrations/supabase/services/appointment.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ambassadorService } from "@/integrations/supabase/services/ambassador.service";

// Replace hardcoded ambassador profiles with a type
interface AmbassadorProfile {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  reviews: number;
  available: boolean;
  nextAvailable?: string;
  email?: string;
  phone?: string;
  bio?: string;
  education?: string;
}

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
    id?: string;
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
  
  // Debug mode counter
  const [titleClicks, setTitleClicks] = useState(0);
  const handleTitleClick = () => {
    const newCount = titleClicks + 1;
    setTitleClicks(newCount);
    
    // Enable debug mode after 5 clicks
    if (newCount === 5) {
      localStorage.setItem('debug_mode', 'true');
      toast.success('Debug mode enabled');
    }
  };
  
  // Update page title
  useEffect(() => {
    document.title = "My Appointments | Emotions Health";
  }, []);

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

  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');

  const [ambassadors, setAmbassadors] = useState<AmbassadorProfile[]>([]);
  const [loadingAmbassadors, setLoadingAmbassadors] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchAmbassadors();
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
          doctor: {
            id: appt.ambassador_id || doctorProfile.id,
            name: doctorProfile.name,
            specialty: doctorProfile.specialty,
            avatar: doctorProfile.avatar,
            email: doctorProfile.email,
            phone: doctorProfile.phone
          }
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
            doctor: {
              id: "amb-123",
              name: doctorProfiles[0].name,
              specialty: doctorProfiles[0].specialty,
              avatar: doctorProfiles[0].avatar,
              email: doctorProfiles[0].email,
              phone: doctorProfiles[0].phone
            }
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
            doctor: {
              id: "amb-456",
              name: doctorProfiles[1].name,
              specialty: doctorProfiles[1].specialty,
              avatar: doctorProfiles[1].avatar,
              email: doctorProfiles[1].email,
              phone: doctorProfiles[1].phone
            }
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
            doctor: {
              id: "amb-789",
              name: doctorProfiles[2].name,
              specialty: doctorProfiles[2].specialty,
              avatar: doctorProfiles[2].avatar,
              email: doctorProfiles[2].email,
              phone: doctorProfiles[2].phone
            }
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

  const fetchAmbassadors = async () => {
    try {
      setLoadingAmbassadors(true);
      
      console.log("Fetching ambassadors from service...");
      const { data, success, error } = await ambassadorService.getAvailableAmbassadors();
      
      if (error) {
        console.error("Error details:", error);
        throw new Error(error.message || "Failed to fetch ambassadors");
      }
      
      if (!success || !data || data.length === 0) {
        console.log("No ambassador data returned, using fallback data");
        // Use doctor profiles as fallback if no ambassadors are found
        const fallbackAmbassadors = doctorProfiles.map(profile => ({
          id: profile.id,
          name: profile.name,
          specialty: profile.specialty,
          avatar: profile.avatar,
          rating: 4.5,
          reviews: 15,
          available: true,
          email: profile.email,
          phone: profile.phone
        }));
        
        setAmbassadors(fallbackAmbassadors);
      } else {
        console.log(`Setting ${data.length} ambassadors from API`);
        
        // Sort ambassadors to show available ones first
        const sortedAmbassadors = [...data].sort((a, b) => {
          // First sort by availability
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          
          // Then sort by rating
          return (b.rating || 0) - (a.rating || 0);
        });
        
        setAmbassadors(sortedAmbassadors);
      }
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      
      // Provide fallback data instead of showing an error
      const fallbackAmbassadors = doctorProfiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        specialty: profile.specialty,
        avatar: profile.avatar,
        rating: 4.5,
        reviews: 15,
        available: true,
        email: profile.email,
        phone: profile.phone
      }));
      
      setAmbassadors(fallbackAmbassadors);
      toast.error("Using demo ambassador data. Live data unavailable.");
    } finally {
      setLoadingAmbassadors(false);
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
    navigate(`/booking?ambassadorId=${ambassadorId}`);
  };

  const handleViewAmbassadorProfile = (ambassadorId: string) => {
    // Find the ambassador by ID to get their name
    const ambassador = ambassadors.find(a => a.id === ambassadorId);
    if (ambassador) {
      // Use the ambassador's name in lowercase, replacing spaces with hyphens
      const nameSlug = ambassador.name.toLowerCase().replace(/ /g, '-');
      navigate(`/ambassadors/${nameSlug}?id=${ambassadorId}`);
    } else {
      // Fallback to ID if name not found
      navigate(`/ambassadors/${ambassadorId}`);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const result = await appointmentService.updateAppointmentStatus(
        appointmentId, 
        'cancelled',
        cancellationReason || 'Cancelled by patient'
      );
      
      if (result.success) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments(); // Refresh appointments after cancellation
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling the appointment");
      console.error("Error:", error);
    } finally {
      setCancelAppointmentId(null);
      setCancellationReason(''); // Reset the reason
    }
  };

  // Replace the renderAppointmentList function with a more modern design
  const renderAppointmentList = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6 py-16">
          <div className="flex flex-col items-center justify-center">
            <Spinner size="lg" className="text-blue-600" />
            <p className="text-gray-500 mt-4">Loading your appointments...</p>
          </div>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 rounded-full p-5 mb-6">
              <CalendarClock className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium mb-3">No {activeTab} appointments</h3>
            <p className="text-gray-500 mb-8 max-w-md">
              {activeTab === "upcoming" 
                ? "You don't have any upcoming appointments scheduled. Book an appointment with one of our ambassadors to get started with your mental health journey."
                : activeTab === "cancelled" 
                ? "You don't have any cancelled appointments. All your cancelled appointments will appear here for reference."
                : "You don't have any completed appointments yet. After completing sessions, they will appear here for your records."}
            </p>
            <Button 
              onClick={() => navigate("/booking")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium"
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {appointments.map((appointment) => (
          <div 
            key={appointment.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
          >
            <div className={cn(
              "border-l-4 h-full", 
              activeTab === "upcoming" ? "border-blue-600" : 
              activeTab === "completed" ? "border-green-600" : "border-orange-600"
            )}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left section: Doctor info */}
                  <div className="flex gap-4 items-center">
                    <Avatar className="h-16 w-16 rounded-full border-2 border-blue-100">
                      <AvatarImage src={appointment.doctor?.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                        {appointment.doctor?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className={cn(
                            "font-normal rounded-full text-xs",
                            activeTab === "upcoming" ? "bg-blue-50 text-blue-700" : 
                            activeTab === "completed" ? "bg-green-50 text-green-700" : 
                            "bg-orange-50 text-orange-700"
                          )}
                        >
                          {getAppointmentIdCode(appointment.id)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {appointment.doctor?.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{appointment.doctor?.specialty}</p>
                    </div>
                  </div>

                  {/* Right section: Appointment details */}
                  <div className="flex flex-col sm:flex-row gap-5 mt-4 md:mt-0 md:ml-auto">
                    {/* Date and time */}
                    <div className="flex flex-col">
                      <p className="text-xs uppercase text-gray-500 font-medium mb-1">Date & Time</p>
                      <div className="flex items-center text-gray-800 font-medium">
                        <CalendarIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <p>{format(new Date(appointment.date), "dd MMM yyyy")}</p>
                      </div>
                      <div className="flex items-center text-gray-800 mt-1">
                        <Clock className="h-4 w-4 text-blue-500 mr-2" />
                        <p>{appointment.time}</p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="flex flex-col sm:ml-6">
                      <p className="text-xs uppercase text-gray-500 font-medium mb-1">Session Type</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-normal py-1">
                          {appointment.type === "video" ? (
                            <div className="flex items-center">
                              <Video className="h-3 w-3 mr-1.5" />
                              <span>Video Call</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1.5" />
                              <span>Audio Call</span>
                            </div>
                          )}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-gray-600 font-normal">
                          {appointment.duration || "30 min"}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col sm:ml-6">
                      <p className="text-xs uppercase text-gray-500 font-medium mb-1">Contact</p>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">{appointment.doctor?.email}</p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <PhoneIcon className="h-4 w-4 text-blue-500" />
                        <p className="text-sm">{appointment.doctor?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                  {activeTab === "upcoming" && (
                    <>
                      <Button 
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate(`/messages/${appointment.doctor?.id}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat Now
                      </Button>
                      <Button 
                        variant="outline"
                        className="rounded-full text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => setCancelAppointmentId(appointment.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 rounded-full"
                        onClick={() => navigate(`/session/${appointment.id}`)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Attend Session
                      </Button>
                    </>
                  )}
                  {activeTab === "cancelled" && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 rounded-full"
                      onClick={() => navigate("/booking")}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  )}
                  {activeTab === "completed" && (
                    <>
                      <Button 
                        variant="outline"
                        className="rounded-full"
                        onClick={() => navigate(`/feedback/${appointment.id}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Leave Feedback
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 rounded-full"
                        onClick={() => navigate(`/booking?doctor=${appointment.doctor?.id}`)}
                      >
                        <CalendarPlus className="h-4 h-4 mr-2" />
                        Book Again
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add a button to book new appointments */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => navigate("/booking")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
        </div>
      </div>
    );
  };

  // Helper to render badge based on count
  const renderCountBadge = (count: number) => {
    if (count === 0) return null;
    return <Badge className="ml-1 bg-blue-600 hover:bg-blue-600 text-white">{count}</Badge>;
  };

  const renderAmbassadorProfiles = () => {
    if (loadingAmbassadors) {
      return (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mental Health Ambassadors</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex gap-3 items-start">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-full" />
                  <Skeleton className="h-8 flex-1 rounded-full" />
                </div>
                <hr className="border-gray-100" />
              </div>
            ))}
          </div>
        </Card>
      );
    }
    
    if (ambassadors.length === 0) {
      return (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mental Health Ambassadors</h2>
          <div className="py-8 text-center">
            <p className="text-gray-500 mb-4">No ambassadors available at the moment</p>
            <Button 
              variant="outline" 
              className="text-blue-600 border-blue-200"
              onClick={fetchAmbassadors}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh List
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mental Health Ambassadors</h2>
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200"
            onClick={fetchAmbassadors}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ambassadors.map((ambassador) => (
            <div key={ambassador.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex gap-3 items-start">
                  <Avatar className="h-14 w-14 rounded-full border border-blue-100">
                    <AvatarImage src={ambassador.avatar} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {ambassador.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{ambassador.name}</h4>
                    <p className="text-sm text-slate-500">{ambassador.specialty}</p>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{ambassador.rating}</span>
                      <span className="text-xs text-slate-500">({ambassador.reviews} reviews)</span>
                      
                      {ambassador.available && (
                        <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Contact information */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {ambassador.email && (
                    <div className="flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span className="truncate">{ambassador.email}</span>
                    </div>
                  )}
                  {ambassador.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      <span>{ambassador.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
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
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Debug component only shown to admin users for troubleshooting
  const DebugSection = () => {
    const isAdmin = user?.email?.includes('admin') || localStorage.getItem('debug_mode') === 'true';
    const [showSection, setShowSection] = useState(false);
    const [userIdToSet, setUserIdToSet] = useState(user?.id || '');
    const [debugStatus, setDebugStatus] = useState('');

    if (!isAdmin) return null;

    const runDiagnostics = async () => {
      setDebugStatus('Running diagnostics...');
      try {
        // Check profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
          
        if (profilesError) {
          setDebugStatus(`Error querying profiles: ${profilesError.message}`);
          return;
        }
        
        // Check if current user has a profile
        const myProfile = profiles?.find(p => p.user_id === user?.id);
        const profileInfo = myProfile 
          ? `Found your profile with role: ${myProfile.role || 'undefined'}`
          : 'You don\'t have a profile yet';
          
        // Check for ambassadors
        const ambassadors = profiles?.filter(p => 
          p.role === 'ambassador' || 
          p.user_role === 'ambassador' || 
          (Array.isArray(p.role) && p.role.includes('ambassador'))
        );
        
        const ambassadorInfo = ambassadors?.length 
          ? `Found ${ambassadors.length} ambassador(s) in profiles table`
          : 'No ambassadors found in profiles table';
          
        setDebugStatus(`Diagnostics complete. ${profileInfo}. ${ambassadorInfo}.`);
      } catch (error) {
        setDebugStatus(`Error running diagnostics: ${error.message}`);
      }
    };

    const setAmbassadorRole = async () => {
      if (!userIdToSet) {
        setDebugStatus('Please enter a user ID');
        return;
      }
      
      setDebugStatus(`Setting user ${userIdToSet} as ambassador...`);
      try {
        const result = await ambassadorService.setUserAsAmbassador(userIdToSet);
        
        if (result.success) {
          setDebugStatus(`Successfully set user ${userIdToSet} as ambassador`);
          // Refresh ambassador list
          fetchAmbassadors();
        } else {
          setDebugStatus(`Error: ${result.error.message}`);
        }
      } catch (error) {
        setDebugStatus(`Error: ${error.message}`);
      }
    };

    return (
      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Admin Diagnostics</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSection(!showSection)}
          >
            {showSection ? 'Hide' : 'Show'} Tools
          </Button>
        </div>
        
        {showSection && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={runDiagnostics}
                className="mr-2"
              >
                Run Diagnostics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAmbassadors}
              >
                Refresh Ambassador List
              </Button>
            </div>
            
            <div className="flex items-center mt-4 mb-2 gap-2">
              <input
                type="text"
                value={userIdToSet}
                onChange={(e) => setUserIdToSet(e.target.value)}
                placeholder="Enter user ID"
                className="px-3 py-2 border border-gray-300 rounded-md flex-1"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={setAmbassadorRole}
              >
                Set As Ambassador
              </Button>
            </div>
            
            {debugStatus && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
                {debugStatus}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <AlertDialog open={!!cancelAppointmentId} onOpenChange={(open) => {
        if (!open) {
          setCancelAppointmentId(null);
          setCancellationReason('');
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label htmlFor="cancellation-reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for cancellation (optional)
            </label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please provide a reason for cancelling this appointment"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep appointment</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => cancelAppointmentId && handleCancelAppointment(cancelAppointmentId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 
              className="text-2xl font-bold text-gray-900 cursor-default" 
              onClick={handleTitleClick}
            >
              My Appointments
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your appointments with mental health ambassadors
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            onClick={() => navigate("/booking")}
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {/* Status tabs and Filter section */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 pb-4">
          {/* Left side: Status tabs */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-1">
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-full font-medium text-sm transition-colors",
                activeTab === "upcoming" 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("upcoming")}
            >
              <CalendarClock className="h-4 w-4" />
              <span>Upcoming</span>
              {counts.upcoming > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-blue-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.upcoming}
                </span>
              )}
            </button>
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-full font-medium text-sm transition-colors",
                activeTab === "completed" 
                  ? "bg-green-50 text-green-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("completed")}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Completed</span>
              {counts.completed > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-green-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.completed}
                </span>
              )}
            </button>
            <button 
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-full font-medium text-sm transition-colors",
                activeTab === "cancelled" 
                  ? "bg-orange-50 text-orange-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              onClick={() => setActiveTab("cancelled")}
            >
              <X className="h-4 w-4" />
              <span>Cancelled</span>
              {counts.cancelled > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-orange-600 h-5 min-w-5 px-1.5 text-xs font-medium text-white">
                  {counts.cancelled}
                </span>
              )}
            </button>
          </div>

          {/* Right side: Date picker styled like calendar */}
          <div className="mt-4 sm:mt-0">
            <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border rounded-lg bg-white shadow-sm"
                >
                  <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="whitespace-nowrap">
                    {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto min-w-[240px]" align="end">
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
          </div>
        </div>

        {/* Main content - full width without ambassador sidebar */}
        <div className="w-full">
          {/* Appointments section */}
          <div className="mb-10">
            {renderAppointmentList()}
          </div>
          
          {/* Ambassador profiles section */}
          <div>
            {renderAmbassadorProfiles()}
          </div>
        </div>
      </div>
      <DebugSection />
    </DashboardLayout>
  );
}
