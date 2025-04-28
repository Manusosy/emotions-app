# Ambassador Dashboard Settings Fix Guide

This guide provides solutions for fixing issues with the Ambassador Dashboard Settings page where entered information is not being saved properly.

## Common Issues

The primary issues affecting the Ambassador Dashboard Settings page include:

1. **Missing Database Columns**: Several required columns might be missing from the `ambassador_profiles` table:
   - `awards` column (for storing ambassador awards)
   - `gender` column (for storing ambassador gender)
   - Other complex data fields (specialties, languages, etc.)

2. **User Role Configuration Problems**: Ambassador users may not have proper role settings in auth metadata

3. **Row Level Security (RLS) Policy Issues**: Permissions might prevent ambassadors from updating their profiles

## Comprehensive Fix Script

We've created a comprehensive script that fixes all potential issues at once:

```bash
# Set up Supabase credentials
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Run the comprehensive fix script
node fix_all_ambassador_issues.js
```

This script:
1. Adds all potentially missing columns to the ambassador_profiles table
2. Fixes user roles in both auth metadata and the users table
3. Verifies and fixes all required RLS policies

## Individual Fix Scripts

If you prefer to address issues individually:

### 1. Fix Missing Awards Column

```bash
# Run the awards column fix script
node apply_awards_column.js
```

### 2. Fix Missing Gender Column

```bash
# Run the gender column fix script
node apply_gender_column.js
```

### 3. Fix Ambassador User Roles

```bash
# Run the role fix script
node fix_ambassador_roles.js
```

## Manual Database Checks

You can also directly check the database structure using Supabase SQL Editor:

```sql
-- Check for missing columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'ambassador_profiles';

-- Check ambassador role settings
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'ambassador';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'ambassador_profiles';
```

## Common Error Messages and Solutions

1. **"Could not find the 'awards' column of 'ambassador_profiles'"**
   - Run `node apply_awards_column.js` to add the awards column

2. **"Could not find the 'gender' column of 'ambassador_profiles'"**
   - Run `node apply_gender_column.js` to add the gender column
   
3. **"row-level security policy" or "permission denied"**
   - Run `fix_all_ambassador_issues.js` to fix RLS policies

## Code Improvements

The SettingsPage component has been updated with:
1. Progressive fallback mechanism for handling missing columns
2. Better error messages and recovery options
3. Separation of core and complex data fields

## Troubleshooting

If problems persist after running the fix scripts:

1. **Check Console Logs**: Look for specific error messages in the browser console
2. **Verify Table Structure**: Ensure all expected columns exist in the ambassador_profiles table
3. **Check RLS Policies**: Verify that ambassadors have permission to update their own profiles
4. **Database Constraints**: Check for any constraints that might be preventing updates

## Need Help?

If you continue experiencing issues after applying these fixes, please provide:
- The specific error message from the console
- The Supabase project ID
- The user ID of the affected ambassador

## Future Prevention

To prevent these issues in the future:

1. Create comprehensive table migrations with all needed columns
2. Add proper error handling for missing columns
3. Test profile updates with different user roles
4. Set up automated tests to verify the dashboard functionality 