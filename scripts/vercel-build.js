#!/usr/bin/env node

/**
 * This script ensures proper builds on Vercel by handling platform-specific dependencies
 * and preparing the environment for Vite builds.
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('Vercel Build: Starting build process...');

try {
  // Run the install-platform-deps script first to ensure platform-specific dependencies
  console.log('Vercel Build: Installing platform-specific dependencies...');
  execSync('node ./scripts/install-platform-deps.js', { stdio: 'inherit' });

  // Run the build command directly (skipping TypeScript check)
  console.log('Vercel Build: Running Vite build (skipping TypeScript checks)...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Vercel Build: Build completed successfully!');
} catch (error) {
  console.error('Vercel Build: Error during build process:');
  console.error(error);
  process.exit(1);
} 