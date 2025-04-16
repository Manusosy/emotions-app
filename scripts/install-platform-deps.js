#!/usr/bin/env node

/**
 * This script installs the correct platform-specific dependencies based on the current OS.
 * It's used during the Netlify build process to ensure the right dependencies are installed.
 */

const { execSync } = require('child_process');
const os = require('os');

function installPlatformDeps() {
  const platform = os.platform();
  const arch = os.arch();
  
  console.log(`Installing platform-specific dependencies for ${platform}-${arch}...`);
  
  try {
    // Base dependencies that should always be installed
    const baseDeps = [
      '@rollup/rollup-linux-x64-gnu@4.9.1',
      '@rollup/rollup-linux-x64-musl@4.9.1'
    ];
    
    // Platform specific dependencies
    const platformDeps = {
      win32: ['@rollup/rollup-win32-x64-msvc@4.9.1'],
      darwin: ['@rollup/rollup-darwin-x64@4.9.1'],
      linux: ['@rollup/rollup-linux-x64-gnu@4.9.1', '@rollup/rollup-linux-x64-musl@4.9.1']
    };
    
    // Install base dependencies first
    console.log('Installing base dependencies...');
    baseDeps.forEach(dep => {
      try {
        execSync(`npm install --no-save ${dep}`, { stdio: 'inherit' });
      } catch (e) {
        console.log(`Warning: Failed to install ${dep}, but continuing...`);
      }
    });
    
    // Install platform-specific dependencies
    if (platformDeps[platform]) {
      console.log(`Installing ${platform} specific dependencies...`);
      platformDeps[platform].forEach(dep => {
        try {
          execSync(`npm install --no-save ${dep}`, { stdio: 'inherit' });
        } catch (e) {
          console.log(`Warning: Failed to install ${dep}, but continuing...`);
        }
      });
    }
    
    console.log('Platform dependencies installation completed.');
  } catch (error) {
    console.error('Error installing platform dependencies:', error);
    process.exit(1);
  }
}

installPlatformDeps(); 