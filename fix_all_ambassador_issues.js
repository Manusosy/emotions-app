// Script to fix all ambassador profile issues including missing columns and roles
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function fixAllAmbassadorIssues() {
  try {
    console.log('Starting comprehensive ambassador profile fix...');
    
    // STEP 1: Add missing columns to ambassador_profiles table
    console.log('\n=== STEP 1: Adding Missing Columns ===');
    await addMissingColumns();
    
    // STEP 2: Fix ambassador user roles
    console.log('\n=== STEP 2: Fixing Ambassador User Roles ===');
    await fixAmbassadorRoles();
    
    // STEP 3: Verify RLS policies
    console.log('\n=== STEP 3: Verifying RLS Policies ===');
    await verifyRlsPolicies();
    
    console.log('\n=== All ambassador profile issues have been fixed successfully! ===');
  } catch (error) {
    console.error('Error fixing ambassador issues:', error);
    process.exit(1);
  }
}

// Function to add all potentially missing columns to ambassador_profiles
async function addMissingColumns() {
  // List of columns to ensure exist with their data types
  const columnsToAdd = [
    { name: 'awards', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'gender', type: 'TEXT', default: "NULL" },
    { name: 'specialties', type: 'TEXT[]', default: "'{}'::text[]" },
    { name: 'languages', type: 'TEXT[]', default: "'{}'::text[]" },
    { name: 'education', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'experience', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'therapyTypes', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'services', type: 'TEXT[]', default: "'{}'::text[]" },
    { name: 'gallery_images', type: 'TEXT[]', default: "'{}'::text[]" },
    { name: 'credentials', type: 'TEXT', default: "NULL" },
    { name: 'consultation_fee', type: 'DECIMAL', default: "0" },
    { name: 'isFree', type: 'BOOLEAN', default: "true" }
  ];
  
  // Build SQL statement to add all missing columns
  let sqlStatements = [];
  
  for (const column of columnsToAdd) {
    sqlStatements.push(`
    -- Add ${column.name} column if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'ambassador_profiles'
            AND column_name = '${column.name}'
        ) THEN
            ALTER TABLE public.ambassador_profiles
            ADD COLUMN "${column.name}" ${column.type} DEFAULT ${column.default};
            RAISE NOTICE 'Added ${column.name} column to ambassador_profiles table';
        ELSE
            RAISE NOTICE '${column.name} column already exists in ambassador_profiles table';
        END IF;
    END
    $$;`);
  }
  
  // Join all SQL statements and execute
  const fullSql = sqlStatements.join('\n\n');
  
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: fullSql
    });
    
    if (error) {
      console.error('Error adding missing columns via RPC:', error);
      console.log('Trying to add columns individually...');
      
      // Try adding columns one by one if batch fails
      for (const column of columnsToAdd) {
        console.log(`Adding column: ${column.name}...`);
        const singleSql = `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'ambassador_profiles'
                AND column_name = '${column.name}'
            ) THEN
                ALTER TABLE public.ambassador_profiles
                ADD COLUMN "${column.name}" ${column.type} DEFAULT ${column.default};
                RAISE NOTICE 'Added ${column.name} column to ambassador_profiles table';
            ELSE
                RAISE NOTICE '${column.name} column already exists in ambassador_profiles table';
            END IF;
        END
        $$;`;
        
        const { error: singleError } = await supabase.rpc('execute_sql', {
          sql_query: singleSql
        });
        
        if (singleError) {
          console.error(`Error adding ${column.name} column:`, singleError);
        } else {
          console.log(`✓ ${column.name} column check completed`);
        }
      }
    } else {
      console.log('✓ All missing columns have been checked and added if needed');
    }
  } catch (sqlError) {
    console.error('Error executing SQL to add columns:', sqlError);
    throw new Error('Failed to add missing columns');
  }
}

// Function to fix ambassador user roles
async function fixAmbassadorRoles() {
  try {
    // Get all users with ambassador profiles
    const { data: ambassadorProfiles, error: profileError } = await supabase
      .from('ambassador_profiles')
      .select('id, full_name, email')
      .order('created_at', { ascending: false });
    
    if (profileError) {
      console.error('Error fetching ambassador profiles:', profileError);
      throw profileError;
    }
    
    console.log(`Found ${ambassadorProfiles?.length || 0} ambassador profiles`);
    
    // Track statistics
    const stats = {
      total: ambassadorProfiles?.length || 0,
      updated: 0,
      alreadyCorrect: 0,
      errors: 0
    };
    
    // Process each ambassador profile
    if (ambassadorProfiles && ambassadorProfiles.length > 0) {
      for (const profile of ambassadorProfiles) {
        try {
          console.log(`\nChecking user ${profile.id} (${profile.email || profile.full_name})...`);
          
          // Get user metadata
          const { data, error: userError } = await supabase.auth.admin.getUserById(profile.id);
          
          if (userError || !data || !data.user) {
            console.error(`Error getting auth data for user ${profile.id}:`, userError);
            stats.errors++;
            continue;
          }
          
          const user = data.user;
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
    } else {
      console.log('No ambassador profiles found.');
    }
    
    // Print summary
    console.log('\n=== Ambassador Role Fix Summary ===');
    console.log(`Total ambassador profiles: ${stats.total}`);
    console.log(`Already correct: ${stats.alreadyCorrect}`);
    console.log(`Updated successfully: ${stats.updated}`);
    console.log(`Errors: ${stats.errors}`);
  } catch (error) {
    console.error('Error in fixAmbassadorRoles:', error);
    throw error;
  }
}

// Function to verify and fix RLS policies
async function verifyRlsPolicies() {
  try {
    console.log('Checking and updating RLS policies...');
    
    // SQL to ensure correct RLS policies
    const rlsPolicySql = `
    -- Enable RLS on ambassador_profiles if not already enabled
    ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

    -- Check for and recreate SELECT policy
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'ambassador_profiles' 
            AND policyname = 'Anyone can view ambassador profiles'
        ) THEN
            CREATE POLICY "Anyone can view ambassador profiles"
              ON public.ambassador_profiles
              FOR SELECT
              USING (true);
            RAISE NOTICE 'Created SELECT policy for ambassador_profiles';
        ELSE
            RAISE NOTICE 'SELECT policy already exists for ambassador_profiles';
        END IF;
    END
    $$;

    -- Check for and recreate UPDATE policy
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'ambassador_profiles' 
            AND policyname = 'Ambassadors can update their own profile'
        ) THEN
            CREATE POLICY "Ambassadors can update their own profile"
              ON public.ambassador_profiles
              FOR UPDATE
              USING (auth.uid() = id);
            RAISE NOTICE 'Created UPDATE policy for ambassador_profiles';
        ELSE
            RAISE NOTICE 'UPDATE policy already exists for ambassador_profiles';
        END IF;
    END
    $$;

    -- Check for and recreate INSERT policy
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'ambassador_profiles' 
            AND policyname = 'Ambassadors can insert their own profile'
        ) THEN
            CREATE POLICY "Ambassadors can insert their own profile"
              ON public.ambassador_profiles
              FOR INSERT
              WITH CHECK (auth.uid() = id);
            RAISE NOTICE 'Created INSERT policy for ambassador_profiles';
        ELSE
            RAISE NOTICE 'INSERT policy already exists for ambassador_profiles';
        END IF;
    END
    $$;

    -- Grant necessary permissions
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT SELECT ON public.ambassador_profiles TO authenticated;
    GRANT UPDATE ON public.ambassador_profiles TO authenticated;
    GRANT INSERT ON public.ambassador_profiles TO authenticated;
    `;
    
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: rlsPolicySql
    });
    
    if (error) {
      console.error('Error updating RLS policies:', error);
      throw error;
    }
    
    console.log('✓ RLS policies have been checked and updated if needed');
  } catch (error) {
    console.error('Error in verifyRlsPolicies:', error);
    throw error;
  }
}

// Run the script
fixAllAmbassadorIssues(); 