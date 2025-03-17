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
}

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'patient' | 'therapist' | 'ambassador'; 