-- Add new columns to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS specialties text[] DEFAULT '{}';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS experience text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS available boolean DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc'::text, now());
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()); 