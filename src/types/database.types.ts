export type UserRole = 'patient' | 'therapist' | 'ambassador' | 'admin';

export interface PatientHealthMetric {
  id: string;
  patient_id: string;
  weight: number;
  blood_pressure: string;
  heart_rate: number;
  mood: string;
  sleep_hours: number;
  recorded_at: string;
}

export interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatar_url: string;
  created_at: string;
}

export interface AmbassadorProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  speciality: string;
  hourly_rate: number;
  availability_status: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface TherapistProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  speciality: string;
  hourly_rate: number;
  availability_status: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone_number: string; // Adding this to match ClientsPage usage
  last_appointment?: string;
  next_appointment?: string;
  status: 'active' | 'inactive';
  total_sessions: number; // Adding this to match ClientsPage usage
  last_session?: string;
}

export interface UserProfile {
  id: string;
  patient_id?: string; // Making this optional to match actual data
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatar_url: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string; // Adding this to match the database
  timestamp: string; // For backward compatibility
  unread: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string; // Changed to string to accommodate database values
  status: string; // Changed to string to accommodate database values
  patient_id?: string;
  ambassador_id?: string;
  notes?: string;
  therapist_name?: string;
  therapist_specialty?: string;
  therapist_avatar?: string;
  duration?: string;
}
