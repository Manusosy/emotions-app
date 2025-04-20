import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, MessageSquare, Plus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment } from "@/types/database.types";

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, [user?.id, filter]);

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

      // Convert database appointments to our Appointment interface
      const mappedAppointments: Appointment[] = data.map(appt => ({
        id: appt.id,
        date: appt.date,
        time: appt.time,
        type: appt.type,
        status: appt.status || "pending",
        patient_id: appt.patient_id,
        ambassador_id: appt.ambassador_id,
        notes: appt.notes,
        duration: appt.duration
      }));

      const filteredData = mappedAppointments.filter((appointment) => {
        if (filter === "all") return true;
        return appointment.status === filter;
      });

      setAppointments(filteredData);
    } catch (error) {
      toast.error("Failed to fetch appointments");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-[#fda901] text-black';
      case 'completed':
        return 'bg-blue-600 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
            <p className="text-sm text-gray-500">Manage your sessions with our ambassadors</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter appointments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All appointments</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={() => navigate("/patient-dashboard/book-appointment")}
              className="bg-[#fda901] text-white hover:bg-[#fda901]/90 w-full sm:w-auto"
            >
              Book Session
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">No appointments found</p>
              <Button 
                onClick={() => navigate("/patient-dashboard/book-appointment")}
                className="bg-[#fda901] text-white hover:bg-[#fda901]/90"
              >
                Book Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="w-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder-avatar.png" />
                      <AvatarFallback className="bg-[#fda901] text-white">
                        {appointment.ambassador_id ? appointment.ambassador_id.charAt(0) : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Ambassador {appointment.ambassador_id?.substring(0, 6)}</h3>
                      <p className="text-sm text-gray-500">Mental Health Support</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-sm font-medium">{appointment.time}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge
                        variant={
                          appointment.status === "upcoming"
                            ? "default"
                            : appointment.status === "completed"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                    {appointment.status === "upcoming" && (
                      <Button 
                        className="w-full mt-4 bg-[#fda901] text-white hover:bg-[#fda901]/90"
                        onClick={() => navigate(`/patient-dashboard/session/${appointment.id}`)}
                      >
                        Join Session
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
