import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MessageSquare, MoreHorizontal, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentDisplay {
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

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    fetchAppointments();
  }, [user, filter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(false);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient_profiles:patient_id(*)
        `)
        .eq('ambassador_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to fit our display interface
      const transformedData = (data || []).map(appointment => ({
        ...appointment,
        patient: {
          name: appointment.patient_profiles?.full_name || appointment.client_name || "Patient",
          avatar: appointment.patient_profiles?.avatar_url || ""
        }
      }));
      
      setAppointments(transformedData);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments();
    } catch (error: any) {
      toast.error(error.message || "Failed to update appointment status");
    }
  };

  const handleJoinSession = (appointmentId: string) => {
    // Navigate to video session
    window.location.href = `/ambassador-dashboard/session/${appointmentId}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500">Manage your upcoming and past appointments</p>
          </div>
          <Button className="bg-[#0078FF] text-white hover:bg-blue-700">
            + New Appointment
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant={filter === "upcoming" ? "default" : "outline"}
                onClick={() => setFilter("upcoming")}
                className={filter === "upcoming" ? "bg-[#0078FF]" : ""}
              >
                Upcoming
              </Button>
              <Button 
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                className={filter === "completed" ? "bg-[#0078FF]" : ""}
              >
                Completed
              </Button>
              <Button 
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
                className={filter === "cancelled" ? "bg-[#0078FF]" : ""}
              >
                Cancelled
              </Button>
            </div>
            <Select defaultValue="today">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {filter} appointments found
              </div>
            ) : (
              <div className="divide-y">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {appointment.patient.avatar ? (
                            <img
                              src={appointment.patient.avatar}
                              alt={appointment.patient.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-bold text-gray-600">
                              {appointment.patient.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{appointment.patient.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {appointment.date} at {appointment.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {filter === "upcoming" && (
                          <>
                            <Button
                              onClick={() => handleJoinSession(appointment.id)}
                              className="bg-[#0078FF] text-white hover:bg-blue-700"
                            >
                              <Video className="w-4 h-4 mr-2" />
                              Join Session
                            </Button>
                            <Button variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsPage;
