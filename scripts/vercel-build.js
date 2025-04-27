#!/usr/bin/env node

/**
 * This script ensures proper builds on Vercel by handling platform-specific dependencies
 * and preparing the environment for Vite builds.
 * It skips TypeScript type checking to allow builds to complete despite TS errors.
 */

import { execSync } from 'child_process';

console.log('Running custom Vercel build script...');

// Check if we're on Vercel
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('Building in Vercel environment');
  
  try {
    // Install dependencies without platform-specific binaries
    console.log('Installing dependencies...');
    execSync('npm install --no-optional --no-package-lock', { stdio: 'inherit' });
    
    // Install platform-specific dependencies for the current environment
    console.log('Installing platform-specific dependencies...');
    execSync('node ./scripts/install-platform-deps.js', { stdio: 'inherit' });
    
    // Run the build
    console.log('Running build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
} else {
  // Local development
  console.log('Building in local environment');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Local build completed successfully');
  } catch (error) {
    console.error('Local build failed:', error.message);
    process.exit(1);
  }
} 