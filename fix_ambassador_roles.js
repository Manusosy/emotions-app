// Script to fix ambassador user roles in the database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and service role key are required.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAmbassadorRoles() {
  try {
    console.log('Checking ambassador profiles and roles...');
    
    // First, get all users with ambassador profiles
    const { data: ambassadorProfiles, error: profileError } = await supabase
      .from('ambassador_profiles')
      .select('id, full_name, email')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('Error fetching ambassador profiles:', profileError);
      throw profileError;
    }
    
    console.log(`Found ${ambassadorProfiles.length} ambassador profiles`);
    
    // Track statistics
    const stats = {
      total: ambassadorProfiles.length,
      updated: 0,
      alreadyCorrect: 0,
      errors: 0
    };
    
    // Process each ambassador profile
    for (const profile of ambassadorProfiles) {
      try {
        console.log(`\nChecking user ${profile.id} (${profile.email || profile.full_name})...`);
        
        // Get user metadata
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userError || !user) {
          console.error(`Error getting auth data for user ${profile.id}:`, userError);
          stats.errors++;
          continue;
        }
        
        const roleInMetadata = user.user_metadata?.role;
        console.log(`Current role in metadata: ${roleInMetadata || 'not set'}`);
        
        // Check if we need to update role
        if (roleInMetadata !== 'ambassador') {
          console.log('Updating user role to "ambassador"...');
          
          // Update metadata
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            profile.id,
            {
              user_metadata: {
                ...user.user_metadata,
                role: 'ambassador'
              }
            }
          );
          
          if (updateError) {
            console.error(`Failed to update role for user ${profile.id}:`, updateError);
            stats.errors++;
          } else {
            console.log('✓ Role updated successfully');
            stats.updated++;
          }
        } else {
          console.log('✓ User already has correct ambassador role');
          stats.alreadyCorrect++;
        }
        
        // Also update public.users table
        const { error: usersTableError } = await supabase
          .from('users')
          .upsert({
            id: profile.id,
            role: 'ambassador',
            email: profile.email,
            full_name: profile.full_name,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        
        if (usersTableError) {
          console.error(`Error updating users table for ${profile.id}:`, usersTableError);
        } else {
          console.log('✓ Users table record updated');
        }
      } catch (err) {
        console.error(`Error processing user ${profile.id}:`, err);
        stats.errors++;
      }
    }
    
    // Print summary
    console.log('\n=== Ambassador Role Fix Summary ===');
    console.log(`Total ambassador profiles: ${stats.total}`);
    console.log(`Already correct: ${stats.alreadyCorrect}`);
    console.log(`Updated successfully: ${stats.updated}`);
    console.log(`Errors: ${stats.errors}`);
    
    // Also run the SQL to make sure awards column exists
    console.log('\nEnsuring awards column exists in ambassador_profiles table...');
    const { error: sqlError } = await supabase.rpc('execute_sql', {
      sql_query: `
      -- Add missing 'awards' column to ambassador_profiles table
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public'
              AND table_name = 'ambassador_profiles'
              AND column_name = 'awards'
          ) THEN
              ALTER TABLE public.ambassador_profiles
              ADD COLUMN awards JSONB DEFAULT '[]'::jsonb;
              RAISE NOTICE 'Added awards column to ambassador_profiles table';
          ELSE
              RAISE NOTICE 'awards column already exists in ambassador_profiles table';
          END IF;
      END
      $$;
      `
    });
    
    if (sqlError) {
      console.error('Error running SQL to add awards column:', sqlError);
      console.log('Please run the apply_awards_column.js script to add the awards column.');
    } else {
      console.log('✓ Awards column check completed');
    }
    
    console.log('\nRole fix process completed');
  } catch (error) {
    console.error('Error fixing ambassador roles:', error);
    process.exit(1);
  }
}

// Run the script
fixAmbassadorRoles(); 