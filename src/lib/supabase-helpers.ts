import { supabase } from '@/integrations/supabase/client';
import { 
  PatientHealthMetric, 
  PatientProfile, 
  AmbassadorProfile,
  TherapistProfile,
  Appointment
} from '@/types/database.types';

// Function to get user profile based on role
export const getUserProfile = async (userId: string, role: string) => {
  try {
    let table;
    switch (role) {
      case 'patient':
        table = 'patient_profiles';
        break;
      case 'ambassador':
        table = 'ambassador_profiles';
        break;
      case 'therapist':
        table = 'therapist_profiles';
        break;
      case 'admin':
        table = 'admin_users'; // Changed from admin_profiles to admin_users which exists
        break;
      default:
        throw new Error('Invalid role');
    }

    const { data, error } = await supabase
      .from(table)
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
    let table;
    switch (role) {
      case 'patient':
        table = 'patient_profiles';
        break;
      case 'ambassador':
        table = 'ambassador_profiles';
        break;
      case 'therapist':
        table = 'therapist_profiles';
        break;
      case 'admin':
        table = 'admin_users'; // Changed from admin_profiles to admin_users
        break;
      default:
        throw new Error('Invalid role');
    }

    const { data, error } = await supabase
      .from(table)
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Patient health metrics functions - will need to create this table if we implement this feature
// For now, let's comment out these functions to avoid TypeScript errors
/*
export const getPatientHealthMetrics = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('patient_health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patient health metrics:', error);
    throw error;
  }
};

export const addPatientHealthMetric = async (metric: Omit<PatientHealthMetric, 'id' | 'recorded_at'>) => {
  try {
    const { data, error } = await supabase
      .from('patient_health_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding patient health metric:', error);
    throw error;
  }
};
*/

// Appointment functions
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
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

export const getAppointments = async (userId: string, role: string) => {
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

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq(column, userId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};
