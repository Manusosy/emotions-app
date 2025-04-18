/**
 * This script installs platform-specific dependencies for the current environment.
 * 
 * It's used during the build process to ensure the right dependencies are installed.
 */

const { execSync } = require('child_process');
const os = require('os');

// Define platform-specific dependencies
const platformDeps = {
  win32: {
    // Windows-specific dependencies
    rollup: '@rollup/rollup-win32-x64-msvc'
  },
  darwin: {
    // macOS-specific dependencies
    rollup: '@rollup/rollup-darwin-x64'
  },
  linux: {
    // Linux-specific dependencies
    rollup: '@rollup/rollup-linux-x64-gnu'
  }
};

// Get current platform
const platform = os.platform();

if (!platformDeps[platform]) {
  console.error(`Unsupported platform: ${platform}`);
  process.exit(1);
}

// Install platform-specific dependencies
console.log(`Installing dependencies for platform: ${platform}`);

try {
  // Install Rollup for the current platform
  const rollupPackage = platformDeps[platform].rollup;
  if (rollupPackage) {
    console.log(`Installing ${rollupPackage}...`);
    execSync(`npm install --no-save ${rollupPackage}`, {
      stdio: 'inherit'
    });
  }

  console.log('Platform-specific dependencies installed successfully!');
} catch (error) {
  console.error('Error installing platform-specific dependencies:', error);
  process.exit(1);
} 