import { supabase } from "../client";

/**
 * Patient Service for dashboard related functionality
 */
export const patientService = {
  /**
   * Get real appointments for a patient with ambassador details
   */
  async getPatientAppointments(patientId: string, status?: string, limit: number = 10) {
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
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      // Limit results
      query = query.limit(limit);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format appointments to match expected interface
      const formattedAppointments = data.map(apt => ({
        id: apt.id,
        appointmentId: `#EMHA${apt.id.substring(0, 2)}`,
        date: new Date(apt.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: apt.type || 'video',
        status: apt.status || 'upcoming',
        ambassador: {
          id: apt.ambassador?.id || '',
          name: apt.ambassador?.full_name || 'Unknown Ambassador',
          specialization: apt.ambassador?.specialization || 'Mental Health Professional',
          avatar_url: apt.ambassador?.avatar_url || '',
          email: apt.ambassador?.email || ''
        },
        notes: apt.notes || ''
      }));
      
      return { success: true, data: formattedAppointments };
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Get appointment reports for a patient
   */
  async getAppointmentReports(patientId: string, filter: string = 'all') {
    try {
      // Build the base query
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          type,
          status,
          notes,
          ambassador_id,
          ambassador_profiles!ambassador_id (
            full_name,
            specialization,
            avatar_url
          )
        `)
        .eq('patient_id', patientId);
      
      // Apply filters
      switch (filter) {
        case 'upcoming':
          query = query.eq('status', 'upcoming');
          break;
        case 'completed':
          query = query.eq('status', 'completed');
          break;
        case 'cancelled':
          query = query.eq('status', 'cancelled');
          break;
        // 'all' - no filter needed
      }
      
      // Order by date (newest first for recent appointments)
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format reports to match UI requirements
      const formattedReports = data.map((apt, index) => ({
        id: `#EMHA${String(index + 1).padStart(2, '0')}`,
        date: new Date(apt.date).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        time: new Date(apt.date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: apt.type === 'video' ? 'Video Call' : 
              apt.type === 'chat' ? 'Chat' : 'In-person',
        status: apt.status.charAt(0).toUpperCase() + apt.status.slice(1),
        ambassador: {
          name: apt.ambassador_profiles?.full_name || 'Unknown Ambassador',
          specialization: apt.ambassador_profiles?.specialization || 'Mental Health Professional',
          avatar_url: apt.ambassador_profiles?.avatar_url || ''
        },
        rawData: apt // Include raw data for reference
      }));
      
      return { success: true, data: formattedReports };
    } catch (error) {
      console.error("Error fetching appointment reports:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Get mock appointment reports (fallback)
   */
  getMockAppointmentReports(filter: string = 'all') {
    const mockReports = [
      {
        id: "#EMHA01",
        ambassador: {
          name: "Dr. Ruby Perrin",
          specialization: "Depression & Anxiety Specialist",
          avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        date: "25 Apr 2025",
        time: "10:30 AM",
        type: "Video Call",
        status: "Upcoming"
      },
      {
        id: "#EMHA02",
        ambassador: {
          name: "Dr. Darren Elder",
          specialization: "Trauma & PTSD Specialist",
          avatar_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        date: "18 Apr 2025",
        time: "11:40 AM",
        type: "Video Call",
        status: "Completed"
      },
      {
        id: "#EMHA03",
        ambassador: {
          name: "Dr. Deborah Angel",
          specialization: "Relationship & Family Specialist",
          avatar_url: "https://images.unsplash.com/photo-1614608997588-8173059e05e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        date: "12 Apr 2025",
        time: "04:00 PM",
        type: "Chat",
        status: "Completed"
      },
      {
        id: "#EMHA04",
        ambassador: {
          name: "Dr. Sofia Brient",
          specialization: "Cognitive Behavioral Therapist",
          avatar_url: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        },
        date: "05 Apr 2025",
        time: "02:15 PM",
        type: "In-person",
        status: "Completed"
      }
    ];
    
    // Apply filter if not "all"
    if (filter !== 'all') {
      return mockReports.filter(report => 
        report.status.toLowerCase() === filter.toLowerCase()
      );
    }
    
    return mockReports;
  }
}; 