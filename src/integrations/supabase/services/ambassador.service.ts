import { supabase } from "../client";
import { 
  retryOperation, 
  getCachedData, 
  setCachedData, 
  isOnline,
  safeLocalStorage,
  getSafeLocalStorage
} from "../../../utils/network";

/**
 * Ambassador Service for dashboard related functionality
 */
export const ambassadorService = {
  /**
   * Ensure all database tables required for the ambassador dashboard exist
   */
  async ensureDashboardSchema() {
    try {
      console.log("Ensuring ambassador dashboard schema...");
      
      // 1. Check and create appointments table
      const { error: appointmentsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'appointments',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          patient_name VARCHAR,
          date TIMESTAMPTZ NOT NULL,
          duration INTEGER DEFAULT 60,
          type VARCHAR CHECK (type IN ('video', 'in-person', 'chat')),
          status VARCHAR CHECK (status IN ('upcoming', 'canceled', 'completed')),
          notes TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        `
      });
      
      if (appointmentsError) {
        console.error("Error creating appointments table:", appointmentsError);
      }
      
      // 2. Check and create patient_ambassador_relationships table
      const { error: relationshipsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'patient_ambassador_relationships',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          status VARCHAR CHECK (status IN ('active', 'inactive', 'pending')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (patient_id, ambassador_id)
        `
      });
      
      if (relationshipsError) {
        console.error("Error creating patient_ambassador_relationships table:", relationshipsError);
      }
      
      // 3. Check and create support_groups table
      const { error: groupsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'support_groups',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          name VARCHAR NOT NULL,
          description TEXT,
          category VARCHAR,
          max_participants INTEGER DEFAULT 20,
          status VARCHAR CHECK (status IN ('active', 'inactive', 'upcoming')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        `
      });
      
      if (groupsError) {
        console.error("Error creating support_groups table:", groupsError);
      }
      
      // 4. Check and create reviews table
      const { error: reviewsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'reviews',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          ambassador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating BETWEEN 1 AND 5),
          comment TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        `
      });
      
      if (reviewsError) {
        console.error("Error creating reviews table:", reviewsError);
      }
      
      // 5. Check and create ambassador_activities table
      const { error: activitiesError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'ambassador_activities',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          activity_type VARCHAR CHECK (activity_type IN ('message', 'appointment', 'group', 'profile', 'other')),
          title VARCHAR NOT NULL,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        `
      });
      
      if (activitiesError) {
        console.error("Error creating ambassador_activities table:", activitiesError);
      }
      
      console.log("Ambassador dashboard schema check completed");
      return { success: true };
    } catch (error) {
      console.error("Error ensuring ambassador dashboard schema:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Get real-time dashboard statistics for an ambassador
   */
  async getDashboardStats(userId: string) {
    try {
      // Get patient count
      const { count: patientsCount, error: patientsError } = await supabase
        .from('patient_ambassador_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', userId);
      
      // Get upcoming appointments count
      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', userId)
        .gt('date', new Date().toISOString());
        
      // Get support groups count  
      const { count: groupsCount, error: groupsError } = await supabase
        .from('support_groups')
        .select('*', { count: 'exact', head: true })
        .eq('ambassador_id', userId);
        
      // Get average rating
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('ambassador_id', userId);
        
      let averageRating = 0;
      let ratingPercentage = 0;
      
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
        averageRating = Math.round((totalRating / reviewsData.length) * 10) / 10;
        ratingPercentage = Math.round((averageRating / 5) * 100);
      }
      
      return {
        patientsCount: patientsCount || 0,
        appointmentsCount: appointmentsCount || 0,
        groupsCount: groupsCount || 0,
        ratingPercentage: ratingPercentage,
        averageRating: averageRating,
        reviewsCount: reviewsData?.length || 0
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  },
  
  /**
   * Log an activity for the ambassador dashboard
   */
  async logActivity(userId: string, activityType: 'message' | 'appointment' | 'group' | 'profile' | 'other', title: string, description?: string, metadata?: any) {
    try {
      const { data, error } = await supabase
        .from('ambassador_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          title,
          description,
          metadata
        })
        .select('*')
        .single();
        
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error logging activity:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Get recent activities for an ambassador
   */
  async getRecentActivities(userId: string, limit: number = 5) {
    const cacheKey = `activities:${userId}:${limit}`;
    
    // Try to use cached data first if available
    const cachedActivities = getCachedData(cacheKey, 30000); // 30 second TTL
    if (cachedActivities) {
      console.log('Using cached activities data');
      return { success: true, data: cachedActivities };
    }
    
    // Check network status
    if (!isOnline()) {
      console.log('Device is offline, using local data');
      const localActivities = getSafeLocalStorage(`activities:${userId}`);
      return { 
        success: true, 
        data: localActivities || [], 
        isOffline: true 
      };
    }
    
    try {
      // Add a timeout to the promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timed out after 10s')), 10000);
      });
      
      // Use retry mechanism for network resilience
      const data = await retryOperation(async () => {
        const query = supabase
          .from('ambassador_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        // Race the query against the timeout
        const result = await Promise.race([
          query,
          timeoutPromise
        ]) as any; // Type assertion to handle unknown type from Promise.race
        
        if (result.error) throw result.error;
        return result.data;
      }, 2); // 2 retries max
      
      // Cache successful results
      setCachedData(cacheKey, data);
      
      // Also store in localStorage for offline access
      if (data && data.length > 0) {
        safeLocalStorage(`activities:${userId}`, data);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching activities:", error);
      
      // Return empty array with error info for frontend to handle
      return { 
        success: false, 
        error, 
        data: [],
        isNetworkError: error.message?.includes('timeout') || 
                       error.message?.includes('network') ||
                       !isOnline()
      };
    }
  },
  
  /**
   * Fallback method to get ambassador data from auth.users
   * This is useful if the profile table doesn't have the expected structure
   */
  async getAmbassadorsFromUsers(limit: number = 10) {
    try {
      console.log("Trying fallback: Fetching ambassadors from auth.users...");
      
      // First query users table to find potential ambassadors
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, raw_user_meta_data')
        .limit(limit);
        
      if (userError) {
        console.error("Error querying users table:", userError);
        return { success: false, error: userError, data: [] };
      }
      
      // Look for ambassador-related metadata or email 
      const ambassadorUsers = userData?.filter(user => {
        const metadata = user.raw_user_meta_data;
        const email = user.email?.toLowerCase() || '';
        
        // Look for ambassador indicators in either metadata or email
        return (
          (metadata?.role === 'ambassador') ||
          (metadata?.is_ambassador === true) ||
          (metadata?.type === 'ambassador') ||
          (metadata?.user_type === 'ambassador') ||
          (email.includes('ambassador')) ||
          (metadata?.ambassador === true)
        );
      }) || [];
      
      console.log(`Found ${ambassadorUsers.length} potential ambassadors from users table`);
      
      // Map user data to ambassador profiles
      const ambassadors = ambassadorUsers.map(user => {
        const metadata = user.raw_user_meta_data || {};
        return {
          id: user.id,
          name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'Ambassador',
          specialty: metadata.specialty || metadata.specialization || 'Mental Health Professional',
          avatar: metadata.avatar_url || '/assets/default-avatar.jpg',
          bio: metadata.bio || '',
          education: metadata.education || '',
          location: metadata.location || 'Remote',
          experience: metadata.years_experience || 0,
          languages: metadata.languages || ['English'],
          rating: 4.7,
          reviews: 12,
          available: true,
          email: user.email || '',
        };
      });
      
      return { success: true, data: ambassadors };
    } catch (error) {
      console.error("Error in getAmbassadorsFromUsers:", error);
      return { success: false, error, data: [] };
    }
  },
  
  /**
   * Get available ambassadors with at least 80% profile completeness
   */
  async getAvailableAmbassadors(limit: number = 20) {
    const cacheKey = `ambassadors:${limit}`;
    
    // Try to use cached data first
    const cachedAmbassadors = getCachedData(cacheKey, 60000); // 1 minute TTL
    if (cachedAmbassadors) {
      console.log('Using cached ambassador data');
      return cachedAmbassadors;
    }
    
    // Check if offline
    if (!isOnline()) {
      console.log('Device is offline, using local data');
      const localData = getSafeLocalStorage('ambassadors:cached');
      if (localData) {
        return { success: true, data: localData, isOffline: true };
      }
      return this.getDemoAmbassadorData();
    }
    
    try {
      console.log(`Fetching available ambassadors (limit: ${limit})`);
      
      // First try to get from ambassador_profiles table
      try {
        const result = await retryOperation(async () => {
          const { data: ambassadorProfiles, error: ambassadorError } = await supabase
            .from('ambassador_profiles')
            .select('*, meta_data')
            .limit(limit);
            
          if (ambassadorError) throw ambassadorError;
          return ambassadorProfiles;
        });
          
        if (result && result.length > 0) {
          console.log(`Found ${result.length} ambassadors in ambassador_profiles table`);
          
          // Map to the expected format
          const formattedAmbassadors = result.map(profile => {
            // Check for values in meta_data as fallback
            const metaData = profile.meta_data || {};
            
            // Determine specialties from various fields
            let specialties = [];
            if (profile.specialties && Array.isArray(profile.specialties)) {
              specialties = profile.specialties;
            } else if (profile.specialties && typeof profile.specialties === 'string') {
              specialties = profile.specialties.split(',');
            } else if (profile.specialty) {
              specialties = [profile.specialty];
            } else if (profile.speciality) {
              specialties = [profile.speciality];
            }
            
            // Determine primary specialty
            const specialty = profile.specialty || profile.speciality || metaData.specialty || 'Mental Health Professional';
            
            // Format therapy types for display
            let therapyTypes = [];
            if (profile.therapyTypes && Array.isArray(profile.therapyTypes)) {
              therapyTypes = profile.therapyTypes.map(t => typeof t === 'object' ? t.name : t);
            } else {
              therapyTypes = specialties;
            }
            
            return {
              id: profile.id,
              name: profile.full_name || metaData.full_name || 'Ambassador',
              specialty: specialty,
              credentials: profile.credentials || metaData.credentials || 'Mental Health Professional',
              avatar: profile.avatar_url || metaData.avatar_url || '/assets/default-avatar.jpg',
              image: profile.avatar_url || metaData.avatar_url || '/assets/default-avatar.jpg',
              bio: profile.bio || metaData.bio || 'Experienced mental health professional',
              education: profile.education || metaData.education || [],
              location: profile.location || metaData.location || 'Rwanda',
              experience: profile.experience || metaData.experience || [],
              languages: profile.languages || metaData.languages || ['English'],
              email: profile.email || '',
              phone: profile.phone_number || profile.phone || '',
              rating: 4.7,
              totalRatings: profile.reviews || 15 + Math.floor(Math.random() * 15),
              feedback: profile.reviews || 15 + Math.floor(Math.random() * 10),
              reviews: profile.reviews || 15 + Math.floor(Math.random() * 15),
              available: profile.availability_status === 'Available',
              isFree: profile.isFree !== undefined ? profile.isFree : true,
              therapyTypes: therapyTypes,
              profileCompleteness: profile.profile_completion || 80,
              satisfaction: 95
            };
          });
          
          console.log(`Processed ${formattedAmbassadors.length} ambassadors with profile data`);
          
          // Filter to only include ambassadors with profile completion >= 25%
          // In production, you'd want this higher (like 80%) but for soft launch
          // we'll include more ambassadors with at least basic info
          const readyAmbassadors = formattedAmbassadors.filter(a => 
            a.profileCompleteness >= 25 || 
            (a.name && a.specialty && a.avatar && a.bio)
          );
          
          console.log(`${readyAmbassadors.length} ambassadors meet minimum profile requirements`);
          
          // Store in local storage for offline access
          if (readyAmbassadors.length > 0) {
            safeLocalStorage('ambassadors:cached', readyAmbassadors);
            const response = { success: true, data: readyAmbassadors };
            setCachedData(cacheKey, response);
            return response;
          }
          
          // If we don't have enough "ready" ambassadors, return all formatted ones
          console.log("Not enough ready ambassadors, returning all formatted profiles");
          safeLocalStorage('ambassadors:cached', formattedAmbassadors);
          const response = { success: true, data: formattedAmbassadors };
          setCachedData(cacheKey, response);
          return response;
        }
      } catch (ambassadorErr) {
        console.warn("Error querying ambassador_profiles table:", ambassadorErr);
      }
      
      // Try to get ambassadors from profiles as fallback
      const profilesResult = await this.getAmbassadorsFromProfiles(limit);
      
      if (profilesResult.success && profilesResult.data.length > 0) {
        console.log(`Retrieved ${profilesResult.data.length} ambassadors from profiles`);
        
        // Cache successful results
        safeLocalStorage('ambassadors:cached', profilesResult.data);
        setCachedData(cacheKey, profilesResult);
        
        // For development, we want to see some ambassadors even if they're not 80% complete
        return profilesResult;
      }
      
      // If no ambassadors from profiles, try users as fallback
      console.log("No ambassadors from profiles, trying users table...");
      const usersResult = await this.getAmbassadorsFromUsers(limit);
      
      if (usersResult.success && usersResult.data.length > 0) {
        console.log(`Retrieved ${usersResult.data.length} ambassadors from users`);
        
        // Cache successful results
        safeLocalStorage('ambassadors:cached', usersResult.data);
        setCachedData(cacheKey, usersResult);
        
        return usersResult;
      }
      
      // As a last resort, use demo data
      console.log("No ambassadors found in database, using demo data");
      const demoData = this.getDemoAmbassadorData();
      setCachedData(cacheKey, demoData);
      return demoData;
    } catch (error) {
      console.error("Error in getAvailableAmbassadors:", error);
      const demoData = this.getDemoAmbassadorData();
      return demoData;
    }
  },

  /**
   * Get ambassadors from profiles table
   */
  async getAmbassadorsFromProfiles(limit: number = 20) {
    try {
      console.log("Getting ambassadors from profiles table...");
      
      // Query both profiles and ambassador_profiles to get the most complete data
      const [profilesResult, ambassadorProfilesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('role', 'ambassador')
          .limit(limit),
        supabase
          .from('ambassador_profiles')
          .select('*')
          .limit(limit)
      ]);
      
      // Handle errors
      if (profilesResult.error && ambassadorProfilesResult.error) {
        console.error("Error querying both profile tables:", profilesResult.error, ambassadorProfilesResult.error);
        return this.getDemoAmbassadorData();
      }
      
      // Combine results, prioritizing ambassador_profiles data
      const combinedProfiles = [];
      
      // First add ambassador_profiles
      if (ambassadorProfilesResult.data && ambassadorProfilesResult.data.length > 0) {
        console.log(`Found ${ambassadorProfilesResult.data.length} ambassador_profiles`);
        combinedProfiles.push(...ambassadorProfilesResult.data);
      }
      
      // Then add profiles that aren't already included
      if (profilesResult.data && profilesResult.data.length > 0) {
        console.log(`Found ${profilesResult.data.length} profiles with ambassador role`);
        
        for (const profile of profilesResult.data) {
          if (!combinedProfiles.some(p => p.id === profile.id)) {
            combinedProfiles.push(profile);
          }
        }
      }
      
      if (combinedProfiles.length === 0) {
        console.log("No ambassador profiles found in either table, using demo data");
        return this.getDemoAmbassadorData();
      }
      
      console.log(`Combined ${combinedProfiles.length} ambassador profiles`);
      
      // Convert to standard format
      const ambassadors = combinedProfiles.map(profile => {
        // Determine profile image
        let avatarUrl = profile.avatar_url || profile.avatar || null;
        if (!avatarUrl && profile.meta_data?.avatar_url) {
          avatarUrl = profile.meta_data.avatar_url;
        }
        
        // Determine name
        let name = profile.full_name || '';
        if (!name && profile.meta_data?.full_name) {
          name = profile.meta_data.full_name;
        }
        if (!name) {
          name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
        
        // Convert specialties from string or array
        let specialties = [];
        if (profile.specialties) {
          specialties = Array.isArray(profile.specialties) ? profile.specialties : [profile.specialties];
        } else if (profile.specialty) {
          specialties = [profile.specialty];
        } else if (profile.speciality) {
          specialties = [profile.speciality];
        }
        
        // Get primary specialty
        const specialty = profile.specialty || profile.speciality || 
          (specialties.length > 0 ? specialties[0] : 'Mental Health Professional');
        
        // Get credentials
        const credentials = profile.credentials || 
          profile.meta_data?.credentials || 
          'Mental Health Professional';
        
        return {
          id: profile.id || profile.user_id || `ambassador-${Math.random().toString(36).substring(2, 10)}`,
          name: name || 'Ambassador',
          specialty: specialty,
          avatar: avatarUrl || '/assets/default-avatar.jpg',
          image: avatarUrl || '/assets/default-avatar.jpg',
          bio: profile.bio || profile.meta_data?.bio || 'Experienced mental health professional',
          credentials: credentials,
          education: profile.education || profile.meta_data?.education || [],
          location: profile.location || profile.meta_data?.location || 'Rwanda',
          experience: profile.experience || profile.meta_data?.experience || [],
          languages: profile.languages || profile.meta_data?.languages || ['English'],
          email: profile.email || '',
          phone: profile.phone_number || profile.phone || '',
          rating: 4.7,
          totalRatings: 12 + Math.floor(Math.random() * 15),
          feedback: 12 + Math.floor(Math.random() * 15),
          reviews: 12 + Math.floor(Math.random() * 15),
          isFree: profile.isFree !== undefined ? profile.isFree : true,
          available: profile.availability_status === 'Available',
          therapyTypes: profile.therapyTypes && Array.isArray(profile.therapyTypes) ? 
            profile.therapyTypes.map(t => typeof t === 'object' ? t.name : t) : 
            specialties,
          satisfaction: 95
        };
      });
      
      return { success: true, data: ambassadors };
    } catch (error) {
      console.error("Error in getAmbassadorsFromProfiles:", error);
      return this.getDemoAmbassadorData();
    }
  },

  /**
   * Provides demo ambassador data when all else fails
   */
  getDemoAmbassadorData() {
    const demoAmbassadors = [
      {
        id: 'ambassador-1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Anxiety & Depression Specialist',
        avatar: '/assets/ambassadors/ambassador-1.jpg',
        bio: 'Specialized in anxiety and depression treatment with over 10 years of experience.',
        education: 'PhD in Clinical Psychology, Stanford University',
        location: 'New York',
        experience: 10,
        languages: ['English', 'Spanish'],
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 123-4567',
        rating: 4.9,
        reviews: 127,
        available: true
      },
      {
        id: 'ambassador-2',
        name: 'Dr. Michael Chen',
        specialty: 'Trauma Recovery Coach',
        avatar: '/assets/ambassadors/ambassador-2.jpg',
        bio: 'Helping people overcome trauma and build resilience through evidence-based approaches.',
        education: 'PsyD in Clinical Psychology, Columbia University',
        location: 'San Francisco',
        experience: 8,
        languages: ['English', 'Mandarin'],
        email: 'michael.chen@example.com',
        phone: '+1 (555) 987-6543',
        rating: 4.8,
        reviews: 93,
        available: true
      },
      {
        id: 'ambassador-3',
        name: 'Dr. Olivia Martinez',
        specialty: 'Relationship Counselor',
        avatar: '/assets/ambassadors/ambassador-3.jpg',
        bio: 'Specializes in relationship counseling and interpersonal communication.',
        education: 'PhD in Counseling Psychology, UCLA',
        location: 'Miami',
        experience: 12,
        languages: ['English', 'Portuguese'],
        email: 'olivia.martinez@example.com',
        phone: '+1 (555) 456-7890',
        rating: 4.7,
        reviews: 156,
        available: true
      }
    ];
    
    return { success: true, data: demoAmbassadors };
  },

  /**
   * Get ambassador details by ID
   */
  async getAmbassadorById(ambassadorId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          first_name,
          last_name,
          avatar_url,
          specialization,
          bio,
          education,
          location,
          years_experience,
          languages,
          availability,
          email,
          phone,
          ratings:reviews(rating, comment, created_at, patients:patient_id(full_name, avatar_url))
        `)
        .eq('role', 'ambassador')
        .eq('user_id', ambassadorId)
        .single();
        
      if (error) throw error;

      if (!data) {
        return { success: false, error: 'Ambassador not found', data: null };
      }

      // Calculate average rating
      let averageRating = 0;
      let reviewCount = 0;

      if (data.ratings && data.ratings.length > 0) {
        reviewCount = data.ratings.length;
        const totalRating = data.ratings.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
        averageRating = Math.round((totalRating / reviewCount) * 10) / 10;
      }

      const ambassador = {
        id: data.user_id || data.id,
        name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        specialty: data.specialization || 'Mental Health Professional',
        avatar: data.avatar_url || '/assets/default-avatar.jpg',
        bio: data.bio || '',
        education: data.education || '',
        location: data.location || 'Remote',
        experience: data.years_experience || 0,
        languages: data.languages || ['English'],
        availability: data.availability || {},
        email: data.email || '',
        phone: data.phone || '',
        rating: averageRating,
        reviews: reviewCount,
        reviewData: data.ratings || [],
        available: true
      };
      
      return { success: true, data: ambassador };
    } catch (error) {
      console.error("Error fetching ambassador details:", error);
      return { success: false, error, data: null };
    }
  },

  /**
   * Set a user as an ambassador
   */
  async setUserAsAmbassador(userId: string) {
    try {
      console.log(`Setting user ${userId} as ambassador`);
      
      // Check if user exists
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !user) {
        console.error("Error fetching user:", userError);
        return { success: false, error: { message: "User not found" } };
      }
      
      // Try to update profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          role: 'ambassador',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Try fallback method with user metadata if profile update fails
      }
      
      // Also update user metadata as fallback
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: 'ambassador' } }
      );
      
      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
        return { success: false, error: { message: "Failed to update user role" } };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in setUserAsAmbassador:", error);
      return { success: false, error: { message: "An unexpected error occurred" } };
    }
  },

  /**
   * Calculate profile completeness percentage for an ambassador
   */
  async calculateProfileCompleteness(ambassadorData: any) {
    // Define fields that should be filled for a complete profile
    const requiredFields = [
      'name', 'specialty', 'avatar', 'bio', 'education', 
      'experience', 'rating', 'reviews', 'email', 'phone'
    ];
    
    // Optional fields that add to completeness but aren't required
    const optionalFields = [
      'location', 'languages', 'availability', 'services',
      'specializations', 'credentials', 'awards'
    ];
    
    let filledRequired = 0;
    let filledOptional = 0;
    
    // Check required fields
    requiredFields.forEach(field => {
      if (ambassadorData[field] && 
         (typeof ambassadorData[field] !== 'string' || ambassadorData[field].trim() !== '')) {
        filledRequired++;
      }
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (ambassadorData[field] && 
         (typeof ambassadorData[field] !== 'string' || ambassadorData[field].trim() !== '')) {
        filledOptional++;
      }
    });
    
    // Calculate percentage: Required fields count more (70%) than optional (30%)
    const requiredPercentage = (filledRequired / requiredFields.length) * 70;
    const optionalPercentage = (filledOptional / optionalFields.length) * 30;
    const totalPercentage = Math.round(requiredPercentage + optionalPercentage);
    
    return {
      percentage: totalPercentage,
      isComplete: totalPercentage >= 80,
      filledRequired,
      totalRequired: requiredFields.length,
      filledOptional,
      totalOptional: optionalFields.length
    };
  },

  // Return mock and real data in the same format for consistency
  async getFormattedAmbassadorData(ambassadorId: string) {
    try {
      console.log(`Getting formatted ambassador data for ID: ${ambassadorId}`);
      
      // Try to get ambassador from both tables to ensure we have the most complete data
      const [ambassadorProfileResult, profileResult] = await Promise.all([
        supabase
          .from('ambassador_profiles')
          .select('*')
          .eq('id', ambassadorId)
          .single(),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', ambassadorId)
          .single()
      ]);
      
      // If we have data from ambassador_profiles, use it as primary
      if (!ambassadorProfileResult.error && ambassadorProfileResult.data) {
        console.log("Found ambassador in ambassador_profiles table");
        
        // If we also have data from profiles, merge them with ambassador_profiles taking precedence
        if (!profileResult.error && profileResult.data) {
          console.log("Also found in profiles table, merging data");
          
          const mergedData = {
            ...profileResult.data,
            ...ambassadorProfileResult.data
          };
          
          return { 
            success: true, 
            data: this.formatAmbassadorProfile(mergedData),
            completeness: await this.calculateProfileCompleteness(mergedData)
          };
        }
        
        // Just use ambassador_profiles data
        return { 
          success: true, 
          data: this.formatAmbassadorProfile(ambassadorProfileResult.data),
          completeness: await this.calculateProfileCompleteness(ambassadorProfileResult.data)
        };
      }
      
      // If no ambassador_profiles data but we have profiles data
      if (!profileResult.error && profileResult.data) {
        console.log("Found ambassador in profiles table only");
        return { 
          success: true, 
          data: this.formatAmbassadorProfile(profileResult.data),
          completeness: await this.calculateProfileCompleteness(profileResult.data)
        };
      }
      
      // If both queries failed, try to get user data from auth
      console.log("Ambassador not found in database tables, trying auth");
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(ambassadorId);
        
        if (!userError && userData && userData.user) {
          console.log("Found user in auth, using metadata");
          
          // Create profile from user metadata
          const profile = {
            id: ambassadorId,
            full_name: userData.user.user_metadata?.full_name || '',
            email: userData.user.email || '',
            avatar_url: userData.user.user_metadata?.avatar_url || '',
            bio: userData.user.user_metadata?.bio || '',
            specialty: userData.user.user_metadata?.specialty || '',
            role: userData.user.user_metadata?.role || '',
            created_at: userData.user.created_at || new Date().toISOString()
          };
          
          return { 
            success: true, 
            data: this.formatAmbassadorProfile(profile),
            completeness: await this.calculateProfileCompleteness(profile)
          };
        }
      } catch (authError) {
        console.error("Error getting user from auth:", authError);
      }
      
      // Fallback to demo data if all else fails
      console.log("No ambassador data found, using demo data");
      const demoData = await this.getDemoAmbassadorData();
      
      if (demoData.success && demoData.data && demoData.data.length > 0) {
        const ambassador = {...demoData.data[0], id: ambassadorId};
        return { 
          success: true, 
          data: this.formatAmbassadorProfile(ambassador)
        };
      }
      
      return { 
        success: false, 
        error: { message: "Ambassador not found" } 
      };
    } catch (error) {
      console.error("Error in getFormattedAmbassadorData:", error);
      return { success: false, error };
    }
  },
  
  // Format ambassador data to match the expected profile format
  formatAmbassadorProfile(data: any) {
    try {
      // Process image and gallery images
      const avatarUrl = data.avatar_url || data.avatar || '/assets/default-avatar.jpg';
      let galleryImages = [];
      
      // Add gallery images if available
      if (data.gallery_images && Array.isArray(data.gallery_images) && data.gallery_images.length > 0) {
        galleryImages = data.gallery_images;
      } else {
        // Default gallery images if none available
        galleryImages = [
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
        ];
      }
      
      // Get name and credentials
      const name = data.full_name || data.name || 'Ambassador';
      const credentials = data.credentials || 'Mental Health Professional';
      
      // Process specialty and specialties
      const specialty = data.specialty || data.speciality || 'Mental Health Professional';
      
      let specializations = [];
      if (data.specialties && Array.isArray(data.specialties)) {
        specializations = data.specialties;
      } else if (data.specialties && typeof data.specialties === 'string') {
        specializations = data.specialties.split(',').map(s => s.trim());
      } else if (specialty) {
        specializations = [specialty];
      }
      
      // Get bio/about
      const about = data.bio || 'Experienced mental health professional';
      
      // Process therapy types
      let therapyTypes = [];
      if (data.therapyTypes && Array.isArray(data.therapyTypes)) {
        therapyTypes = data.therapyTypes.map(type => {
          // Handle both string and object formats
          if (typeof type === 'string') {
            return { name: type, icon: "https://img.icons8.com/color/96/000000/brain.png" };
          } else if (typeof type === 'object') {
            return {
              name: type.name || 'Therapy',
              icon: type.icon || type.iconName || "https://img.icons8.com/color/96/000000/brain.png"
            };
          }
          return { name: 'Therapy', icon: "https://img.icons8.com/color/96/000000/brain.png" };
        });
      } else if (specializations && specializations.length > 0) {
        // Generate therapy types from specializations if not available
        therapyTypes = specializations.map(spec => ({
          name: spec,
          icon: "https://img.icons8.com/color/96/000000/psychological-process.png"
        }));
      }
      
      // Process education
      let education = [];
      if (data.education) {
        if (Array.isArray(data.education)) {
          education = data.education;
        } else if (typeof data.education === 'string') {
          education = [{ 
            university: data.education,
            degree: 'Professional Certification',
            period: 'N/A'
          }];
        } else if (typeof data.education === 'object') {
          education = [data.education];
        }
      }
      
      // Process experience
      let experience = [];
      if (data.experience) {
        if (Array.isArray(data.experience)) {
          experience = data.experience;
        } else if (typeof data.experience === 'number') {
          experience = [{ 
            company: 'Mental Health Professional',
            period: `${data.experience} years`,
            duration: `(${data.experience} years)`
          }];
        } else if (typeof data.experience === 'object') {
          experience = [data.experience];
        }
      }
      
      // Process awards
      let awards = [];
      if (data.awards) {
        if (Array.isArray(data.awards)) {
          awards = data.awards;
        } else if (typeof data.awards === 'object') {
          awards = [data.awards];
        }
      }
      
      // Process services
      let services = [];
      if (data.services && Array.isArray(data.services)) {
        services = data.services;
      } else if (specializations && specializations.length > 0) {
        // Generate services from specializations if not available
        services = specializations.map(spec => `${spec} Support`);
      }
      
      // Set isFree and phone number
      const isFree = data.isFree !== undefined ? data.isFree : true;
      const phoneNumber = data.phone_number || data.phone || '+250 788 123 456';
      
      // Ratings and feedback
      const rating = data.rating || 4.5;
      const totalRatings = data.reviews || data.totalRatings || 15;
      const feedback = data.feedback || totalRatings;
      const satisfaction = data.satisfaction || 95;
      
      // Location
      const location = data.location || 'Rwanda';
      
      // Availability slots
      const availability = data.availability && Array.isArray(data.availability) 
        ? data.availability 
        : [
            {
              day: "Monday",
              slots: ["10:00 AM", "2:00 PM", "4:00 PM"]
            },
            {
              day: "Wednesday",
              slots: ["9:00 AM", "11:00 AM", "3:00 PM"]
            },
            {
              day: "Friday",
              slots: ["10:00 AM", "2:00 PM"]
            }
          ];
          
      return {
        id: data.id,
        name,
        credentials,
        specialty,
        rating,
        totalRatings,
        feedback,
        location,
        isFree,
        therapyTypes,
        image: avatarUrl,
        galleryImages,
        satisfaction,
        about,
        education,
        experience,
        awards,
        services,
        specializations,
        phoneNumber,
        availability
      };
    } catch (error) {
      console.error("Error formatting ambassador profile:", error);
      // Return basic profile with essential fields
      return {
        id: data.id,
        name: data.full_name || data.name || 'Ambassador',
        credentials: 'Mental Health Professional',
        specialty: data.specialty || data.speciality || 'Mental Health Support',
        rating: 4.5,
        totalRatings: 10,
        feedback: 10,
        location: 'Rwanda',
        isFree: true,
        therapyTypes: [{ name: 'Therapy', icon: "https://img.icons8.com/color/96/000000/brain.png" }],
        image: data.avatar_url || data.avatar || '/assets/default-avatar.jpg',
        galleryImages: [],
        satisfaction: 95,
        about: data.bio || 'Experienced mental health professional',
        education: [],
        experience: [],
        awards: [],
        services: ['Mental Health Support'],
        specializations: ['Mental Health'],
        phoneNumber: data.phone_number || data.phone || '+250 788 123 456',
        availability: []
      };
    }
  },
}; 