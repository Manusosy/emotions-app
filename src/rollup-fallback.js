
/**
 * This file provides fallback exports for Rollup native modules
 * and is used by the Vite config when the native modules can't be loaded.
 */

// Export empty objects as fallback implementations for platform-specific modules
export const rollupLinuxGnu = {};
export const rollupLinuxMusl = {};
export const rollupWin32Msvc = {};
export const rollupDarwinX64 = {};

// Add a console message to indicate the fallback is being used
console.log('Using Rollup fallbacks for platform-specific modules');

export default {
  rollupLinuxGnu,
  rollupLinuxMusl,
  rollupWin32Msvc,
  rollupDarwinX64
};
