# Ambassador Profile - Fix isFree Column Issue

This guide will help you fix the "`Failed to update profile: Could not find the 'isFree' column of 'ambassador_profiles' in the schema cache`" error.

## Option 1: Use the SQL Script in Supabase Dashboard (Recommended)

1. Open your Supabase dashboard and navigate to the SQL Editor
2. Copy the contents of the `fix_isFree_column.sql` file in this directory
3. Paste it into the SQL Editor and run it
4. The SQL script will:
   - Check if the column exists and add it if needed
   - Set default values for any existing records
   - Create a fallback in the meta_data column 
   - Create a function to refresh schema cache

5. Restart your application and clear browser cache to use the new column

## Option 2: Use the Direct Fix Script

If you prefer to run a script:

```bash
node add_isFree_direct.js <your-supabase-url> <your-supabase-key>
```

Replace `<your-supabase-url>` and `<your-supabase-key>` with your actual Supabase URL and API key.

## Option 3: Run the Migration Command

If the above options don't work, you can directly run:

```bash
ALTER TABLE ambassador_profiles ADD COLUMN "isFree" BOOLEAN DEFAULT true;
```

After running any of these fixes, you need to:

1. Refresh your browser completely (Ctrl+F5 or ⌘+Shift+R)
2. Log out and log back in to refresh all Supabase client caches
3. Restart the application if it's running locally

## Understanding the Issue

The error occurs because:

1. The frontend code is trying to save an `isFree` field to the ambassador_profiles table
2. The database doesn't have this column (or the Supabase client has a stale schema cache)
3. The SQL migration was successful, but Supabase's client-side schema cache hasn't updated

This is a common issue when adding new columns to Supabase tables - the client maintains a schema cache that sometimes doesn't get updated immediately after schema changes.

## Prevention for Future Development

For future column additions:

1. Always use the `IF NOT EXISTS` clause when adding columns
2. Consider adding a meta_data JSONB column for flexible storage
3. After adding columns, call a refresh function or restart the application
4. For production apps, implement graceful fallbacks for missing columns

If you have any questions or the issue persists, please contact the development team. 