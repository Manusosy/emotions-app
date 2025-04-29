import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling ambassador profiles
 */
export const profileService = {
  /**
   * Ensures all required columns exist in the ambassador_profiles table
   */
  async ensureAmbassadorProfileSchema() {
    try {
      // First run the migration script to ensure table and columns exist
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          -- Make sure the ambassador_profiles table exists
          CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            full_name TEXT,
            email TEXT,
            phone_number TEXT,
            bio TEXT,
            specialties TEXT[],
            languages TEXT[],
            education JSONB,
            experience JSONB,
            credentials TEXT,
            specialty TEXT,
            location TEXT,
            therapyTypes JSONB,
            services TEXT[],
            awards JSONB,
            availability_status TEXT,
            consultation_fee NUMERIC,
            isFree BOOLEAN,
            avatar_url TEXT,
            gallery_images TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
          );
          
          -- Add columns if they don't exist
          DO $$
          BEGIN
            -- Check and add awards column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_schema = 'public' 
                          AND table_name = 'ambassador_profiles'
                          AND column_name = 'awards') THEN
              ALTER TABLE public.ambassador_profiles ADD COLUMN awards JSONB;
            END IF;

            -- Check and add education column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_schema = 'public' 
                          AND table_name = 'ambassador_profiles'
                          AND column_name = 'education') THEN
              ALTER TABLE public.ambassador_profiles ADD COLUMN education JSONB;
            END IF;

            -- Check and add experience column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_schema = 'public' 
                          AND table_name = 'ambassador_profiles'
                          AND column_name = 'experience') THEN
              ALTER TABLE public.ambassador_profiles ADD COLUMN experience JSONB;
            END IF;

            -- Check and add therapyTypes column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_schema = 'public' 
                          AND table_name = 'ambassador_profiles'
                          AND column_name = 'therapyTypes') THEN
              ALTER TABLE public.ambassador_profiles ADD COLUMN therapyTypes JSONB;
            END IF;

            -- Check and add gallery_images column
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_schema = 'public' 
                          AND table_name = 'ambassador_profiles'
                          AND column_name = 'gallery_images') THEN
              ALTER TABLE public.ambassador_profiles ADD COLUMN gallery_images TEXT[];
            END IF;
          END $$;
        `
      });

      if (error) {
        console.error('Error ensuring ambassador profile schema:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (err) {
      console.error('Exception ensuring ambassador profile schema:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Fetches an ambassador profile by user ID
   */
  async getAmbassadorProfile(userId: string) {
    try {
      // Ensure schema first
      const schemaResult = await this.ensureAmbassadorProfileSchema();
      if (!schemaResult.success) {
        console.error('Failed to ensure ambassador profile schema:', schemaResult.error);
      }

      try {
        const { data, error } = await supabase
          .from('ambassador_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching ambassador profile:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          return { data: null, error };
        }

        return { data, error: null };
      } catch (fetchError) {
        console.error('Exception fetching ambassador profile:', fetchError);
        return { 
          data: null, 
          error: fetchError instanceof Error 
            ? { message: fetchError.message, code: 'FETCH_ERROR' } 
            : { message: 'Unknown error', code: 'UNKNOWN' }
        };
      }
    } catch (err) {
      console.error('Top-level exception in getAmbassadorProfile:', err);
      return { 
        data: null, 
        error: err instanceof Error 
          ? { message: err.message, code: 'GENERAL_ERROR' } 
          : { message: 'Unknown error', code: 'UNKNOWN' }
      };
    }
  },

  /**
   * Updates or creates an ambassador profile
   */
  async upsertAmbassadorProfile(profile: any) {
    try {
      // Ensure schema first
      await this.ensureAmbassadorProfileSchema();

      const { data, error } = await supabase
        .from('ambassador_profiles')
        .upsert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error upserting ambassador profile:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception upserting ambassador profile:', err);
      return { data: null, error: err };
    }
  }
}; 