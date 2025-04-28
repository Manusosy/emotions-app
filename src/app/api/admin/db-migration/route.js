import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { action } = await request.json();
    
    if (action === 'add_consultation_fee') {
      // Add consultation_fee column to ambassador_profiles if it doesn't exist
      const sql = `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'ambassador_profiles' 
            AND column_name = 'consultation_fee'
          ) THEN
            ALTER TABLE public.ambassador_profiles 
            ADD COLUMN consultation_fee DECIMAL DEFAULT 0;
            RAISE NOTICE 'Added consultation_fee column to ambassador_profiles table';
          ELSE
            RAISE NOTICE 'consultation_fee column already exists in ambassador_profiles table';
          END IF;
        END
        $$;
      `;
      
      // Execute the SQL using pgSQL directly with admin privileges
      const { error: sqlError } = await supabase.rpc('execute_sql', { sql_query: sql });
      
      if (sqlError) {
        console.error('SQL execution error:', sqlError);
        return NextResponse.json(
          { error: 'Failed to execute SQL', details: sqlError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Added consultation_fee column to ambassador_profiles table' 
      });
    }
    
    // Default response for unknown actions
    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Add a GET handler to check migration status
export async function GET(request) {
  try {
    // Get authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if the consultation_fee column exists in ambassador_profiles
    const { data, error } = await supabase.rpc('check_column_exists', {
      table_name: 'ambassador_profiles',
      column_name: 'consultation_fee'
    });
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to check column status', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      consultation_fee_exists: !!data,
      checked_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 