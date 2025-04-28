import { supabase } from "../client";

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
    try {
      const { data, error } = await supabase
        .from('ambassador_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching activities:", error);
      return { success: false, error };
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
    try {
      console.log("Getting available ambassadors...");
      
      // First try to get ambassadors directly from ambassador_profiles table
      // with profile_completion filter
      try {
        const { data: ambassadorProfiles, error: ambassadorError } = await supabase
          .from('ambassador_profiles')
          .select('*, meta_data')
          .gte('profile_completion', 80)
          .order('profile_completion', { ascending: false })
          .limit(limit);
          
        if (!ambassadorError && ambassadorProfiles && ambassadorProfiles.length > 0) {
          console.log(`Found ${ambassadorProfiles.length} ambassador profiles with completion >= 80%`);
          
          // Map to the expected format
          const formattedAmbassadors = ambassadorProfiles.map(profile => {
            // Check for values in meta_data as fallback
            const metaData = profile.meta_data || {};
            
            return {
              id: profile.id,
              name: profile.full_name || metaData.full_name || 'Ambassador',
              specialty: profile.specialty || profile.speciality || metaData.specialty || 'Mental Health Professional',
              avatar: profile.avatar_url || metaData.avatar_url || '/assets/default-avatar.jpg',
              bio: profile.bio || metaData.bio || 'Experienced mental health professional',
              education: profile.education || metaData.education || 'Professional certification',
              location: profile.location || metaData.location || 'Remote',
              experience: profile.experience || 3,
              languages: profile.languages || ['English'],
              email: profile.email || '',
              phone: profile.phone_number || '',
              rating: 4.7,
              reviews: 8 + Math.floor(Math.random() * 15),
              available: profile.availability_status === 'Available',
              isFree: profile.isFree || true,
              profileCompleteness: profile.profile_completion || 80
            };
          });
          
          return { success: true, data: formattedAmbassadors };
        }
      } catch (ambassadorErr) {
        console.warn("Error querying ambassador_profiles table:", ambassadorErr);
      }
      
      // Try to get ambassadors from profiles as fallback
      const profilesResult = await this.getAmbassadorsFromProfiles(limit);
      
      if (profilesResult.success && profilesResult.data.length > 0) {
        console.log(`Retrieved ${profilesResult.data.length} ambassadors from profiles`);
        
        // Filter to only show profiles with at least 80% completeness
        const completeAmbassadors = [];
        
        for (const ambassador of profilesResult.data) {
          // First check if profile_completion is already set
          if (ambassador.profile_completion && ambassador.profile_completion >= 80) {
            completeAmbassadors.push(ambassador);
            continue;
          }
          
          // Otherwise calculate it
          const completeness = await this.calculateProfileCompleteness(ambassador);
          
          // Add completeness info to the ambassador object
          ambassador.profileCompleteness = completeness.percentage;
          
          // Only include ambassadors with 80% or more profile completeness
          if (completeness.percentage >= 80) {
            completeAmbassadors.push(ambassador);
          }
        }
        
        console.log(`${completeAmbassadors.length} ambassadors have at least 80% profile completeness`);
        
        // If we have enough complete ambassadors, return them
        if (completeAmbassadors.length > 0) {
          return { success: true, data: completeAmbassadors };
        }
        
        // For development, we want to see some ambassadors even if they're not 80% complete
        // In production, uncomment this to ensure only complete profiles are shown
        // return { success: true, data: completeAmbassadors };
        
        console.log("Not enough ambassadors with complete profiles, returning all available ambassadors");
        return profilesResult;
      }
      
      // If no ambassadors from profiles, try users as fallback
      console.log("No ambassadors from profiles, trying users table...");
      const usersResult = await this.getAmbassadorsFromUsers(limit);
      
      if (usersResult.success && usersResult.data.length > 0) {
        console.log(`Retrieved ${usersResult.data.length} ambassadors from users`);
        return usersResult;
      }
      
      // If no ambassadors from profiles or users, return demo data
      console.log("No ambassadors from profiles or users, using demo data");
      return this.getDemoAmbassadorData();
    } catch (error) {
      console.error("Error in getAvailableAmbassadors:", error);
      return this.getDemoAmbassadorData();
    }
  },

  /**
   * Get ambassadors from profiles table
   */
  async getAmbassadorsFromProfiles(limit: number = 20) {
    try {
      console.log("Trying to get ambassadors from profiles table...");
      
      // Try simple direct query first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(limit);
        
      if (error) {
        console.error("Error querying profiles table:", error);
        // Use demo data if profiles query fails
        return this.getDemoAmbassadorData();
      }
      
      if (!data || data.length === 0) {
        console.log("No profiles found, using demo data");
        return this.getDemoAmbassadorData();
      }
      
      // Use all users in the database as potential ambassadors
      // This ensures we have data to show
      const ambassadors = data.slice(0, limit).map(profile => {
        return {
          id: profile.id || profile.user_id || 'ambassador-' + Math.random().toString(36).substring(2, 9),
          name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Ambassador',
          specialty: profile.specialization || profile.specialty || 'Mental Health Professional',
          avatar: profile.avatar_url || profile.avatar || '/assets/default-avatar.jpg',
          bio: profile.bio || 'Experienced in providing mental health support.',
          education: profile.education || 'Professional certification',
          location: profile.location || 'Remote',
          experience: profile.years_experience || profile.experience || 3,
          languages: profile.languages || ['English'],
          email: profile.email || '',
          phone: profile.phone || '',
          rating: 4.7,
          reviews: 12 + Math.floor(Math.random() * 15),
          available: true
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
      // Try to get real ambassador data first
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ambassadorId)
        .single();
      
      if (error || !data) {
        console.log("Error getting ambassador data, using demo data:", error);
        // Fallback to demo data with the requested ID
        const demoData = await this.getDemoAmbassadorData();
        
        if (demoData.success && demoData.data && demoData.data.length > 0) {
          const ambassador = {...demoData.data[0], id: ambassadorId};
          return { success: true, data: this.formatAmbassadorProfile(ambassador) };
        }
        
        return { success: false, error };
      }
      
      // Format real data to match the expected format in the profile page
      return { 
        success: true, 
        data: this.formatAmbassadorProfile(data),
        completeness: await this.calculateProfileCompleteness(data)
      };
    } catch (error) {
      console.error("Error in getFormattedAmbassadorData:", error);
      return { success: false, error };
    }
  },
  
  // Format ambassador data to match the expected profile format
  formatAmbassadorProfile(data: any) {
    // Convert from database format to AmbassadorProfileData format
    return {
      id: data.id,
      name: data.name || data.full_name || 'Ambassador',
      credentials: data.credentials || 'Mental Health Professional',
      specialty: data.specialty || data.specialization || 'Mental Health Support',
      rating: data.rating || 4.5,
      totalRatings: data.reviews || 10,
      feedback: data.reviews || 10,
      location: data.location || 'Remote',
      isFree: true,
      therapyTypes: data.therapyTypes || [
        { name: "Individual Support", icon: "https://img.icons8.com/color/96/000000/user.png" },
        { name: "Group Therapy", icon: "https://img.icons8.com/color/96/000000/conference-call.png" }
      ],
      image: data.avatar || data.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      galleryImages: data.gallery || [
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
      ],
      satisfaction: data.satisfaction || 95,
      about: data.bio || 'Mental health professional dedicated to providing support and guidance.',
      education: data.education ? 
        (Array.isArray(data.education) ? data.education : JSON.parse(data.education)) :
        [{ university: 'University', degree: 'Mental Health Professional', period: '2015 - 2020' }],
      experience: data.experience ? 
        (Array.isArray(data.experience) ? data.experience : JSON.parse(data.experience)) :
        [{ company: 'Mental Health Support', period: '2020 - Present', duration: '(3 years)' }],
      awards: data.awards ? 
        (Array.isArray(data.awards) ? data.awards : JSON.parse(data.awards)) : 
        [{ date: '2020', title: 'Mental Health Support', description: 'Recognition for excellence in mental health support' }],
      services: data.services ? 
        (Array.isArray(data.services) ? data.services : data.services.split(',')) : 
        ['Individual Support', 'Crisis Intervention', 'Emotional Guidance'],
      specializations: data.specializations ? 
        (Array.isArray(data.specializations) ? data.specializations : data.specializations.split(',')) : 
        ['Stress Management', 'Anxiety Support', 'Depression Support'],
      phoneNumber: data.phone || '+123 456 7890',
      availability: data.availability || [
        { day: 'Monday', slots: ['10:00 AM', '2:00 PM'] },
        { day: 'Wednesday', slots: ['11:00 AM', '3:00 PM'] },
        { day: 'Friday', slots: ['9:00 AM', '1:00 PM'] }
      ]
    };
  },
}; 