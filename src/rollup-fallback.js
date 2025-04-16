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

// Common Rollup module exports
export const defineConfig = () => ({});
export const rollup = async () => ({
  generate: async () => ({}),
  write: async () => ({}),
  close: async () => {}
});

// Log that we're using the fallback implementation
console.log('Using Rollup fallbacks for platform-specific modules');

// Default export combining all exports
export default {
  rollupLinuxGnu,
  rollupLinuxMusl,
  rollupWin32Msvc,
  rollupDarwinX64,
  rollupDarwinArm64,
  defineConfig,
  rollup
};

// Fallback module for Rollup native dependencies
module.exports = {};
