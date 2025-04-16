
/**
 * This file provides fallback exports for Rollup native modules
 * and is used by the Vite config when the native modules can't be loaded.
 */

// Export empty objects as fallback implementations for platform-specific modules
export const rollupLinuxGnu = {};
export const rollupLinuxMusl = {};
export const rollupWin32Msvc = {};
export const rollupDarwinX64 = {};
export const rollupDarwinArm64 = {}; // Add ARM64 support for newer Macs

// Log that we're using the fallback implementation
console.log('Using Rollup fallbacks for platform-specific modules');

export default {
  rollupLinuxGnu,
  rollupLinuxMusl,
  rollupWin32Msvc,
  rollupDarwinX64,
  rollupDarwinArm64
};
