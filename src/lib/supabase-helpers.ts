import { supabase } from "@/integrations/supabase/client";
import type { 
  PatientProfile, 
  TherapistProfile, 
  AmbassadorProfile, 
  PatientHealthMetric,
  Appointment,
  UserRole 
} from "@/types/database.types";

// Profile Management
export const getProfile = async (userId: string, role: UserRole) => {
  const { data, error } = await supabase
    .from(`${role}_profiles`)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createProfile = async (
  userId: string, 
  role: UserRole, 
  profileData: Partial<PatientProfile | TherapistProfile | AmbassadorProfile>
) => {
  const { data, error } = await supabase
    .from(`${role}_profiles`)
    .insert({ id: userId, ...profileData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (
  userId: string, 
  role: UserRole, 
  profileData: Partial<PatientProfile | TherapistProfile | AmbassadorProfile>
) => {
  const { data, error } = await supabase
    .from(`${role}_profiles`)
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Patient-specific operations
export const getPatientHealthMetrics = async (patientId: string) => {
  const { data, error } = await supabase
    .from('patient_health_metrics')
    .select('*')
    .eq('patient_id', patientId)
    .order('recorded_at', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data;
};

export const addHealthMetric = async (metric: Omit<PatientHealthMetric, 'id' | 'recorded_at'>) => {
  const { data, error } = await supabase
    .from('patient_health_metrics')
    .insert(metric)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Appointment Management
export const getAppointments = async (userId: string, role: UserRole) => {
  const field = role === 'patient' ? 'patient_id' : 'therapist_id';
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patient_profiles(*),
      therapist:therapist_profiles(*)
    `)
    .eq(field, userId)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Ambassador-specific operations
export const getAmbassadorStats = async (ambassadorId: string) => {
  const { data, error } = await supabase
    .from('ambassador_profiles')
    .select('total_referrals, rating')
    .eq('id', ambassadorId)
    .single();
  
  if (error) throw error;
  return data;
};

// Therapist-specific operations
export const getTherapistPatients = async (therapistId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      distinct on (patient_id) *,
      patient:patient_profiles(*)
    `)
    .eq('therapist_id', therapistId);
  
  if (error) throw error;
  return data;
}; 