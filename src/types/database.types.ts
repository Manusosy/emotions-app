
export interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string;
  blood_type: string;
  medical_history: string;
  emergency_contact: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  phone_number?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PatientHealthMetric {
  id: string;
  patient_id: string;
  heart_rate: number;
  blood_pressure: string;
  temperature: number;
  glucose_level: number;
  recorded_at: string;
}

export interface TherapistProfile {
  id: string;
  first_name: string;
  last_name: string;
  speciality: string;
  license_number: string;
  years_of_experience: number;
  education: string;
  bio: string;
  hourly_rate: number;
  availability_status: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

export interface AmbassadorProfile {
  id: string;
  first_name: string;
  last_name: string;
  speciality: string;
  bio: string;
  hourly_rate: number;
  availability_status: string;
  total_referrals: number;
  rating: number;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  full_name?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id?: string;
  ambassador_id?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'upcoming';
  type: 'video' | 'chat' | 'voice' | string;
  notes: string;
  created_at: string;
  updated_at: string;
  duration?: string;
  therapist_name?: string;
  therapist_specialty?: string;
  therapist_avatar?: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  schedule: string;
  max_participants: number;
  price: number;
  ambassador_id: string;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  last_appointment: string;
  next_appointment: string;
  status: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  created_at: string;
  downloads?: number;
  shares?: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  unread: boolean;
}

export interface UserProfile {
  patient_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
}

export type UserRole = 'patient' | 'therapist' | 'ambassador' | 'admin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  country?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  date_of_birth?: string;
  created_at?: string;
}
