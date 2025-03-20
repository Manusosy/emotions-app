import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrations = [
  // Remove hourly_rate column
  `ALTER TABLE public.ambassador_profiles DROP COLUMN IF EXISTS hourly_rate;`,
  
  // Update existing profiles
  `UPDATE public.ambassador_profiles
   SET availability_status = 'Available'
   WHERE availability_status IS NULL OR availability_status = '';`
];

async function applyMigrations() {
  try {
    for (const sql of migrations) {
      console.log('Executing:', sql);
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('Error executing SQL:', error);
        return;
      }
    }
    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

applyMigrations(); 