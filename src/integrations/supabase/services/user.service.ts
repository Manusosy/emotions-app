import { supabase } from '../client';
import type { UserRole } from '@/hooks/use-auth';

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  onboarding_completed?: boolean;
  country?: string;
  gender?: string;
};

class UserService {
  /**
   * Create a user profile in the users table after signup
   */
  async createUserProfile(profile: Partial<UserProfile>) {
    if (!profile.id) {
      throw new Error('User ID is required to create a profile');
    }

    return await supabase
      .from('users')
      .insert([
        {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role || 'patient',
          onboarding_completed: profile.onboarding_completed || false,
        }
      ])
      .select()
      .single();
  }

  /**
   * Get a user profile by ID
   */
  async getUserProfile(userId: string) {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
  }

  /**
   * Update a user profile
   */
  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    return await supabase
      .from('users')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, filePath: string) {
    // First update the storage if needed
    
    // Then update the profile
    return await this.updateUserProfile(userId, {
      avatar_url: filePath
    });
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding(userId: string) {
    return await this.updateUserProfile(userId, {
      onboarding_completed: true
    });
  }

  /**
   * Get specific role data (patient or ambassador)
   */
  async getRoleSpecificData(userId: string, role: UserRole) {
    if (role === 'ambassador') {
      return await supabase
        .from('ambassador_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    } else if (role === 'patient') {
      return await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', userId)
        .single();
    }
    
    return { data: null, error: new Error('Invalid role') };
  }
}

export const userService = new UserService(); 