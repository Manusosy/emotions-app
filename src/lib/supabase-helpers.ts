import { supabase } from '@/integrations/supabase/client';
import { 
  PatientHealthMetric, 
  PatientProfile, 
  AmbassadorProfile,
  TherapistProfile,
  Appointment
} from '@/types/database.types';

// Use explicit type assertions to resolve type issues
export const getUserProfile = async (userId: string, role: string) => {
  try {
    let tableName = '';
    
    // Define the table name based on role
    switch (role) {
      case 'patient':
        tableName = 'patient_profiles';
        break;
      case 'ambassador':
        tableName = 'ambassador_profiles';
        break;
      case 'therapist':
        tableName = 'therapist_profiles';
        break;
      case 'admin':
        tableName = 'admin_users';
        break;
      default:
        throw new Error('Invalid role');
    }

    // Use concrete types to avoid type recursion issues
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Function to update user profile based on role
export const updateUserProfile = async (userId: string, role: string, profileData: any) => {
  try {
    let tableName = '';
    
    // Define the table name based on role
    switch (role) {
      case 'patient':
        tableName = 'patient_profiles';
        break;
      case 'ambassador':
        tableName = 'ambassador_profiles';
        break;
      case 'therapist':
        tableName = 'therapist_profiles';
        break;
      case 'admin':
        tableName = 'admin_users';
        break;
      default:
        throw new Error('Invalid role');
    }

    // Use concrete types to avoid type recursion issues
    const { data, error } = await supabase
      .from(tableName as any)
      .update(profileData)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Appointment functions
export const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
  try {
    // Convert the appointment data to match the table structure
    const formattedAppointment = {
      patient_id: appointment.patient_id,
      ambassador_id: appointment.ambassador_id,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      status: appointment.status || 'pending',
      notes: appointment.notes,
      duration: appointment.duration || '60 minutes' // Default duration
    };

    // Use a concrete table name to avoid TS2589 error
    const { data, error } = await supabase
      .from('appointments')
      .insert(formattedAppointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointments = async (userId: string, role: string): Promise<Appointment[]> => {
  try {
    let column;
    switch (role) {
      case 'patient':
        column = 'patient_id';
        break;
      case 'ambassador':
        column = 'ambassador_id';
        break;
      default:
        throw new Error('Invalid role');
    }

    // Break up the query into separate operations to avoid deep type instantiation
    const query = supabase
      .from('appointments')
      .select('*')
      .eq(column, userId)
      .order('date', { ascending: false });
      
    // Execute the query
    const { data, error } = await query.order('time', { ascending: false });

    if (error) throw error;
    
    // Explicitly cast the result to Appointment[]
    return (data || []) as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};
