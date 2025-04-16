#!/usr/bin/env node

/**
 * This script installs the correct platform-specific dependencies based on the current OS.
 * It's used during the Netlify build process to ensure the right dependencies are installed.
 */

import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform();
console.log(`Detected platform: ${platform}`);

try {
  if (platform === 'linux') {
    console.log('Installing Linux-specific dependencies...');
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1', { stdio: 'inherit' });
    console.log('✅ Linux dependencies installed successfully');
  } else if (platform === 'win32') {
    console.log('Installing Windows-specific dependencies...');
    execSync('npm install --no-save @rollup/rollup-win32-x64-msvc@4.9.1', { stdio: 'inherit' });
    console.log('✅ Windows dependencies installed successfully');
  } else if (platform === 'darwin') {
    console.log('Installing macOS-specific dependencies...');
    execSync('npm install --no-save @rollup/rollup-darwin-x64@4.9.1', { stdio: 'inherit' });
    console.log('✅ macOS dependencies installed successfully');
  } else {
    console.warn(`Unsupported platform: ${platform}. Skipping platform-specific dependencies.`);
  }
  
  console.log('✅ Platform-specific dependency installation completed');
} catch (error) {
  console.error('Error installing platform-specific dependencies:', error);
  // Don't exit with error to allow build to continue
  console.log('Continuing with build despite installation errors...');
} 