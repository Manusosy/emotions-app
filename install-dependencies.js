/**
 * This script installs all necessary dependencies for Netlify
 */
const { execSync } = require('child_process');

console.log('Installing platform-specific dependencies for Netlify...');

try {
  // Get the current platform
  const platform = process.platform;
  console.log(`Current platform: ${platform}`);

  // If on Linux, do nothing (Netlify is Linux-based)
  if (platform === 'linux') {
    console.log('On Linux, no additional dependencies needed');
    process.exit(0);
  }

  // Otherwise, install the Linux binaries
  console.log('Installing Rollup Linux binaries...');
  execSync('npm install --no-save @rollup/rollup-linux-x64-gnu', { stdio: 'inherit' });
  
  console.log('All dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  // Don't fail the build if this fails
  process.exit(0);
} 