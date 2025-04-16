
/**
 * This file provides fallback exports for Rollup native modules
 * and is used by the Vite config when the native modules can't be loaded.
 */

// Export an empty object as a fallback implementation
export const rollupLinuxGnu = {};
export const rollupLinuxMusl = {};
export const rollupWin32Msvc = {};
export const rollupDarwinX64 = {};

export default {
  rollupLinuxGnu,
  rollupLinuxMusl,
  rollupWin32Msvc,
  rollupDarwinX64
};
