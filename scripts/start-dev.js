
#!/usr/bin/env node

/**
 * This script ensures all platform-specific dependencies are handled
 * before starting the development server
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const platform = os.platform();

console.log(`Starting dev server on platform: ${platform}`);

// Ensure fallback module exists
const rollupFallbackPath = path.join(rootDir, 'src', 'rollup-fallback.js');
if (!fs.existsSync(rollupFallbackPath)) {
  console.log('Creating Rollup fallback module...');
  const fallbackContent = `
/**
 * This file provides fallback exports for Rollup native modules
 * that might be missing during build time.
 */

// Export dummy objects for all potential platform-specific modules
export const rollupLinuxGnu = {
  name: 'rollup-linux-x64-gnu-fallback'
};

export const rollupLinuxMusl = {
  name: 'rollup-linux-x64-musl-fallback'
};

export const rollupWin32Msvc = {
  name: 'rollup-win32-x64-msvc-fallback'
};

export const rollupDarwinX64 = {
  name: 'rollup-darwin-x64-fallback'
};

export const rollupDarwinArm64 = {
  name: 'rollup-darwin-arm64-fallback'
}; 

// Log that we're using the fallback implementation
console.log('Using Rollup fallbacks for platform-specific modules');

// Default export for direct imports
export default {
  rollupLinuxGnu,
  rollupLinuxMusl,
  rollupWin32Msvc,
  rollupDarwinX64,
  rollupDarwinArm64
};
`;
  fs.writeFileSync(rollupFallbackPath, fallbackContent);
}

// Run necessary pre-checks and fixes
try {
  // Fix Radix UI toggle components first
  console.log('Running fix-radix.js...');
  execSync('node scripts/fix-radix.js', { stdio: 'inherit' });
  console.log('✅ Radix components fixed');
  
  // Now start the dev server with the Vite workarounds
  console.log('Starting Vite dev server...');
  execSync('vite --force', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_USE_FALLBACKS: 'true'
    }
  });
} catch (error) {
  console.error('Error starting development server:', error);
  process.exit(1);
}
