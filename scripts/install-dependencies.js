
#!/usr/bin/env node

/**
 * This script installs all dependencies including platform-specific ones
 * It's important to include this for CI/CD environments
 */

import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform();
console.log(`Installing dependencies for platform: ${platform}`);

// Install main dependencies first
try {
  console.log('Installing main dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Main dependencies installed successfully');
} catch (error) {
  console.error('Error installing main dependencies:', error);
  process.exit(1);
}

// Now install platform-specific rollup dependencies
try {
  if (platform === 'linux') {
    console.log('Installing Linux-specific dependencies...');
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1', { stdio: 'inherit' });
    console.log('✅ Linux dependencies installed successfully');
  } else if (platform === 'win32') {
    console.log('Installing Windows-specific dependencies...');
    execSync('npm install --no-save @rollup/rollup-win32-x64-msvc@4.9.1', { stdio: 'inherit' });
    console.log('✅ Windows dependencies installed successfully');
  } else if (platform === 'darwin') {
    console.log('Installing macOS-specific dependencies...');
    const arch = os.arch();
    if (arch === 'arm64') {
      execSync('npm install --no-save @rollup/rollup-darwin-arm64@4.9.1', { stdio: 'inherit' });
    } else {
      execSync('npm install --no-save @rollup/rollup-darwin-x64@4.9.1', { stdio: 'inherit' });
    }
    console.log('✅ macOS dependencies installed successfully');
  } else {
    console.warn(`Unsupported platform: ${platform}. Installing all platform dependencies...`);
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@4.9.1 @rollup/rollup-linux-x64-musl@4.9.1 @rollup/rollup-win32-x64-msvc@4.9.1 @rollup/rollup-darwin-x64@4.9.1 @rollup/rollup-darwin-arm64@4.9.1', { stdio: 'inherit' });
  }
  
  console.log('✅ All dependencies installed successfully!');
} catch (error) {
  console.error('Error installing platform-specific dependencies:', error);
  // Continue despite errors to allow build to proceed
  console.log('Continuing despite installation errors...');
}
