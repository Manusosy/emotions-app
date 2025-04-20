import { supabase } from '../client';
import type { UserRole } from '@/hooks/use-auth';

export type AuthSignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  country: string;
  gender?: string | null;
};

export type AuthSignInData = {
  email: string;
  password: string;
};

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: AuthSignUpData) {
    console.log('Signing up user with data:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      country: data.country
    });

    try {
      // Step 1: Create auth user
      const authResponse = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            role: data.role,
            country: data.country,
            gender: data.gender || null,
            onboarding_completed: true,
          }
        }
      });

      if (authResponse.error) {
        console.error('Auth signup error:', authResponse.error);
        throw authResponse.error;
      }

      console.log('User created in auth:', authResponse.data.user?.id);

      // Important: No need to manually insert into the users table
      // The database trigger should handle this for us
      
      // Step 3: Return the signup data
      return authResponse;
    } catch (error) {
      console.error('Signup process failed:', error);
      throw error;
    }
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(data: AuthSignInData) {
    try {
      console.log('Attempting to sign in user:', data.email);
      const authResponse = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authResponse.error) {
        console.error('Sign in error:', authResponse.error);
        throw authResponse.error;
      }

      console.log('User signed in successfully:', authResponse.data.user?.id);
      return authResponse;
    } catch (error) {
      console.error('Sign in process failed:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    return await supabase.auth.signOut();
  }

  /**
   * Get the current session
   */
  async getSession() {
    return await supabase.auth.getSession();
  }

  /**
   * Get the current user
   */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  /**
   * Setup auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, any>) {
    return await supabase.auth.updateUser({
      data: metadata
    });
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }

  /**
   * Update password
   */
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({
      password: password
    });
  }
}

export const authService = new AuthService(); 