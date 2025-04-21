export type UserRole = 'patient' | 'ambassador' | 'admin';

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

export interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone_number: string;
  last_appointment?: string;
  next_appointment?: string;
  status: 'active' | 'inactive';
  total_sessions: number;
  last_session?: string;
}

export interface User {
  id: string;
  email: string;
  created_at?: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    full_name?: string;
    avatar_url?: string;
    phone_number?: string;
    date_of_birth?: string;
    country?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    patient_id?: string;
  };
}

export interface UserProfile {
  id: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender?: string;
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
  created_at: string;
  timestamp: string;
  unread: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  patient_id?: string;
  ambassador_id?: string;
  notes?: string;
  duration?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  file_url?: string;
  created_at: string;
  downloads?: number;
  shares?: number;
}
