
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { componentTagger } from "lovable-tagger";

// Determine if building for Netlify
const isNetlify = process.env.NETLIFY === 'true';

// Enhanced handling of missing Rollup binaries
const handleNativeRollupPlugin = {
  name: 'handle-native-rollup',
  resolveId(id: string) {
    // Handle any Rollup platform-specific module
    if (id.includes('@rollup/rollup-')) {
      console.log(`Creating virtual module for ${id}`);
      return '\0virtual:' + id;
    }
    return null;
  },
  load(id: string) {
    // Return empty module for any Rollup platform-specific module
    if (id.startsWith('\0virtual:@rollup/rollup-')) {
      console.log(`Providing empty module for ${id}`);
      return 'export default {};';
    }
    return null;
  }
};

// Load the local fallback module for debugging
const rollupFallbackPath = path.resolve(__dirname, 'src/rollup-fallback.js');
if (!fs.existsSync(rollupFallbackPath)) {
  console.warn('Rollup fallback module not found at ' + rollupFallbackPath);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Plugin to handle Radix UI toggle dependencies
    {
      name: 'replace-radix-toggle-imports',
      resolveId(id: string) {
        // Replace Radix UI toggle imports with virtual empty modules
        if (id === '@radix-ui/react-toggle' || id === '@radix-ui/react-toggle-group') {
          return id;
        }
        return null;
      },
      load(id: string) {
        // Return empty module for Radix toggle imports
        if (id === '@radix-ui/react-toggle') {
          return 'export default {}; export const Root = () => null;';
        }
        if (id === '@radix-ui/react-toggle-group') {
          return 'export default {}; export const Root = () => null; export const Item = () => null;';
        }
        return null;
      }
    },
    // Enhanced Rollup native module handler
    handleNativeRollupPlugin,
    // Use index-netlify.html for Netlify builds if it exists
    {
      name: 'use-netlify-index',
      config(config: any) {
        if (isNetlify || process.env.USE_NETLIFY_INDEX) {
          const netifyIndexPath = path.resolve(__dirname, 'index-netlify.html');
          if (fs.existsSync(netifyIndexPath)) {
            console.log('Using index-netlify.html for Netlify build');
            return {
              build: {
                ...config.build,
                rollupOptions: {
                  ...config.build?.rollupOptions,
                  input: {
                    main: netifyIndexPath
                  }
                }
              }
            };
          }
        }
        return null;
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add fallbacks for ALL Rollup native modules - more comprehensive
      '@rollup/rollup-linux-x64-gnu': path.resolve(__dirname, 'src/rollup-fallback.js'),
      '@rollup/rollup-linux-x64-musl': path.resolve(__dirname, 'src/rollup-fallback.js'),
      '@rollup/rollup-win32-x64-msvc': path.resolve(__dirname, 'src/rollup-fallback.js'),
      '@rollup/rollup-darwin-x64': path.resolve(__dirname, 'src/rollup-fallback.js'),
      '@rollup/rollup-darwin-arm64': path.resolve(__dirname, 'src/rollup-fallback.js')
    }
  },
  optimizeDeps: {
    exclude: [
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-win32-x64-msvc',
      '@rollup/rollup-darwin-x64',
      '@rollup/rollup-darwin-arm64'
    ],
    esbuildOptions: {
      // Prevent esbuild from attempting to bundle native modules
      plugins: [{
        name: 'ignore-native-modules',
        setup(build) {
          build.onResolve({ filter: /@rollup\/rollup-.*/ }, args => {
            return { path: rollupFallbackPath, external: false };
          });
        }
      }]
    }
  },
  server: {
    port: 8080,
    host: "::"
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Ignore warnings about missing rollup dependencies
        if (warning.code === 'MISSING_EXPORT' && warning.message.includes('@rollup/rollup-')) {
          return;
        }
        warn(warning);
      }
    }
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://ekpiqiatfwozmepkgbbe.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y")
  }
}));
