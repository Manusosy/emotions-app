import { supabase } from '@/integrations/supabase/client';
import { 
  PatientHealthMetric, 
  PatientProfile, 
  AmbassadorProfile,
  TherapistProfile,
  Appointment,
  AdminUser
} from '@/types/database.types';

type UserProfileType = PatientProfile | AmbassadorProfile | TherapistProfile | AdminUser;
type TableNames = 'patient_profiles' | 'ambassador_profiles' | 'therapist_profiles' | 'admin_users';

const getRoleTable = (role: string): TableNames => {
  switch (role) {
    case 'patient':
      return 'patient_profiles';
    case 'ambassador':
      return 'ambassador_profiles';
    case 'therapist':
      return 'therapist_profiles';
    case 'admin':
      return 'admin_users';
    default:
      throw new Error('Invalid role');
  }
};

// Use explicit type assertions to resolve type issues
export const getUserProfile = async (userId: string, role: string): Promise<UserProfileType | null> => {
  try {
    const tableName = getRoleTable(role);

    const { data, error } = await supabase
      .from(tableName)
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
export const updateUserProfile = async <T extends UserProfileType>(
  userId: string, 
  role: string, 
  profileData: Partial<T>
): Promise<T | null> => {
  try {
    const tableName = getRoleTable(role);

    const { data, error } = await supabase
      .from(tableName)
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

    // Using a simpler approach to avoid excessive type inference
    const result = await supabase
      .from('appointments')
      .select('*')
      .eq(column, userId);
      
    if (result.error) throw result.error;
    
    // Sort the data in memory after fetching
    const sortedData = result.data ? [...result.data].sort((a, b) => {
      // First sort by date (descending)
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // Then sort by time (descending)
      return b.time.localeCompare(a.time);
    }) : [];
    
    return sortedData as Appointment[];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
};

export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ error: Error | null; url: string | null }> => {
  // ... existing code ...
};

export const downloadFile = async (
  bucket: string,
  path: string
): Promise<{ data: Uint8Array | null; error: Error | null }> => {
  // ... existing code ...
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<{ error: Error | null }> => {
  // ... existing code ...
};
