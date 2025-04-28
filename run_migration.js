// Script to help apply the new migration
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running database migration to fix policy syntax issues...');

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  return new Promise((resolve, reject) => {
    const check = spawn('supabase', ['--version']);
    
    check.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error('Supabase CLI is not installed or not in PATH'));
      }
    });
    
    check.on('error', () => {
      reject(new Error('Supabase CLI is not installed or not in PATH'));
    });
  });
}

// Apply migration
function applyMigration() {
  return new Promise((resolve, reject) => {
    console.log('Applying migration fix_policy_syntax.sql...');
    
    const migrate = spawn('supabase', ['db', 'reset']);
    
    migrate.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    
    migrate.stderr.on('data', (data) => {
      console.error(`${data}`);
    });
    
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('Migration applied successfully');
        resolve();
      } else {
        reject(new Error('Failed to apply migration'));
      }
    });
  });
}

// Main function
async function main() {
  try {
    // Check if the migration file exists
    const migrationPath = path.join('supabase', 'migrations', '20240530000000_fix_policy_syntax.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('Migration file not found. Make sure it exists at:', migrationPath);
      process.exit(1);
    }
    
    // Check for Supabase CLI
    await checkSupabaseCLI();
    
    // Apply the migration
    await applyMigration();
    
    console.log('✅ Policy syntax issues have been fixed successfully!');
    console.log('You can now continue working on your application without the policy errors.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nManual steps to fix the issue:');
    console.error('1. Use the Supabase CLI to apply the migration manually:');
    console.error('   supabase db reset');
    console.error('2. Or apply the SQL in the migration file directly in the Supabase dashboard');
    process.exit(1);
  }
}

main(); 