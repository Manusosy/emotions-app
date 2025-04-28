import { supabase } from "../client";
import { format } from "date-fns";

// Type definitions for appointment data
export interface AppointmentAmbassador {
  id: string;
  name: string;
  full_name?: string;
  specialization: string;
  avatar_url: string;
  email?: string;
}

export interface AppointmentData {
  id: string;
  appointmentId?: string;
  date: string;
  time: string;
  type: string;
  status: string;
  ambassador: AppointmentAmbassador;
  notes?: string;
  duration?: string;
  meeting_link?: string;
  patient_id?: string;
  rawData?: any;
}

/**
 * Centralized service for appointment management
 */
export const appointmentService = {
  /**
   * Get appointments for a patient with filtering options
   * 
   * @param patientId - Patient ID to fetch appointments for
   * @param status - Optional status filter (upcoming, completed, cancelled)
   * @param dateRange - Optional date range for filtering
   * @param limit - Optional limit on number of results
   */
  async getPatientAppointments(
    patientId: string, 
    status?: string, 
    dateRange?: { startDate: Date; endDate: Date },
    limit: number = 20
  ) {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          ambassador:ambassador_id (
            id,
            full_name,
            specialization,
            avatar_url,
            email
          )
        `)
        .eq('patient_id', patientId);
      
      // Add status filter if provided
      if (status && status !== 'all') {
        query = query.eq('status', status.toLowerCase());
      }
      
      // Add date range filter if provided
      if (dateRange) {
        const { startDate, endDate } = dateRange;
        query = query
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);
      }
      
      // Order by date
      query = query.order('date', { ascending: status === 'completed' ? false : true });
      
      // Limit results
      if (limit > 0) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format appointments to match expected interface
      const formattedAppointments: AppointmentData[] = data.map(apt => ({
        id: apt.id,
        appointmentId: `#EMHA${apt.id.substring(0, 2)}`,
        date: format(new Date(apt.date), 'dd MMM yyyy'),
        time: format(new Date(`${apt.date}T${apt.time}`), 'h:mm a'),
        type: this.formatAppointmentType(apt.type),
        status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
        meeting_link: apt.meeting_link,
        duration: apt.duration || '30 minutes',
        ambassador: {
          id: apt.ambassador?.id || '',
          name: apt.ambassador?.full_name || 'Unknown Ambassador',
          specialization: apt.ambassador?.specialization || 'Mental Health Professional',
          avatar_url: apt.ambassador?.avatar_url || '',
          email: apt.ambassador?.email || ''
        },
        notes: apt.notes || '',
        patient_id: apt.patient_id,
        rawData: apt // Include raw data for reference
      }));
      
      return { 
        success: true, 
        data: formattedAppointments,
        counts: {
          upcoming: data.filter(a => a.status === 'upcoming').length,
          completed: data.filter(a => a.status === 'completed').length,
          cancelled: data.filter(a => a.status === 'cancelled').length,
          total: data.length
        }
      };
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      return { success: false, error, data: [] };
    }
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointmentById(appointmentId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          ambassador:ambassador_id (
            id,
            full_name,
            specialization,
            avatar_url,
            email
          )
        `)
        .eq('id', appointmentId)
        .single();
        
      if (error) throw error;
      
      if (!data) return { success: false, error: "Appointment not found" };
      
      // Format the appointment data
      const appointment: AppointmentData = {
        id: data.id,
        appointmentId: `#EMHA${data.id.substring(0, 2)}`,
        date: format(new Date(data.date), 'dd MMM yyyy'),
        time: format(new Date(`${data.date}T${data.time}`), 'h:mm a'),
        type: this.formatAppointmentType(data.type),
        status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
        meeting_link: data.meeting_link,
        duration: data.duration || '30 minutes',
        ambassador: {
          id: data.ambassador?.id || '',
          name: data.ambassador?.full_name || 'Unknown Ambassador',
          specialization: data.ambassador?.specialization || 'Mental Health Professional',
          avatar_url: data.ambassador?.avatar_url || '',
          email: data.ambassador?.email || ''
        },
        notes: data.notes || '',
        patient_id: data.patient_id,
        rawData: data
      };
      
      return { success: true, data: appointment };
    } catch (error) {
      console.error("Error fetching appointment:", error);
      return { success: false, error };
    }
  },

  /**
   * Book a new appointment for a patient
   */
  async bookAppointment(appointmentData: {
    patient_id: string;
    ambassador_id: string;
    date: string;
    time: string;
    type: string;
    notes?: string;
    duration?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: appointmentData.patient_id,
          ambassador_id: appointmentData.ambassador_id,
          date: appointmentData.date,
          time: appointmentData.time,
          type: appointmentData.type,
          status: 'upcoming',
          notes: appointmentData.notes || null,
          duration: appointmentData.duration || '30 minutes',
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) throw error;
      
      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error booking appointment:", error);
      return { success: false, error };
    }
  },

  /**
   * Update an appointment status (cancel, reschedule, complete)
   */
  async updateAppointmentStatus(appointmentId: string, status: 'upcoming' | 'completed' | 'cancelled', notes?: string) {
    try {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select();
      
      if (error) throw error;
      
      return { success: true, data: data[0] };
    } catch (error) {
      console.error("Error updating appointment status:", error);
      return { success: false, error };
    }
  },

  /**
   * Helper function to format appointment types
   */
  formatAppointmentType(type: string): string {
    switch(type?.toLowerCase()) {
      case 'video':
        return 'Video Call';
      case 'audio':
      case 'voice':
        return 'Audio Call';
      case 'chat':
        return 'Chat';
      case 'in-person':
        return 'In-person';
      default:
        return type || 'Consultation';
    }
  },

  /**
   * Get mock appointments (fallback when real data is unavailable)
   */
  getMockAppointments(filter: string = 'all') {
    const mockAppointments: AppointmentData[] = [
      {
        id: "1",
        appointmentId: "#EMHA01",
        date: "25 Apr 2025",
        time: "10:30 AM",
        type: "Video Call",
        status: "Upcoming",
        ambassador: {
          id: "amb1",
          name: "Dr. Ruby Perrin",
          specialization: "Depression & Anxiety Specialist",
          avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        notes: "Follow-up consultation for anxiety management"
      },
      {
        id: "2",
        appointmentId: "#EMHA02",
        date: "18 Apr 2025",
        time: "11:40 AM",
        type: "Video Call",
        status: "Completed",
        ambassador: {
          id: "amb2",
          name: "Dr. Darren Elder",
          specialization: "Trauma & PTSD Specialist",
          avatar_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        }
      },
      {
        id: "3",
        appointmentId: "#EMHA03",
        date: "12 Apr 2025",
        time: "04:00 PM",
        type: "Chat",
        status: "Completed",
        ambassador: {
          id: "amb3",
          name: "Dr. Deborah Angel",
          specialization: "Relationship & Family Specialist",
          avatar_url: "https://images.unsplash.com/photo-1614608997588-8173059e05e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        }
      },
      {
        id: "4",
        appointmentId: "#EMHA04",
        date: "05 Apr 2025",
        time: "02:15 PM",
        type: "In-person",
        status: "Cancelled",
        ambassador: {
          id: "amb4",
          name: "Dr. Sofia Brient",
          specialization: "Cognitive Behavioral Therapist",
          avatar_url: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        }
      }
    ];
    
    // Apply filter if not "all"
    if (filter !== 'all') {
      return mockAppointments.filter(appointment => 
        appointment.status.toLowerCase() === filter.toLowerCase()
      );
    }
    
    return mockAppointments;
  }
}; 