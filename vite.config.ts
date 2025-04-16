import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Determine if building for Netlify
const isNetlify = process.env.NETLIFY === 'true';

// Handle missing Rollup binaries by creating a plugin
const handleNativeRollupPlugin = {
  name: 'handle-native-rollup',
  resolveId(id: string) {
    // Handle all platform-specific Rollup modules
    if (id.includes('@rollup/rollup-') && 
        (id.includes('-gnu') || id.includes('-musl') || id.includes('-msvc') || id.includes('-darwin'))) {
      console.log(`Creating virtual module for ${id}`);
      return '\0virtual:' + id;
    }
    return null;
  },
  load(id: string) {
    // Return empty module for native modules if they can't be loaded
    if (id.startsWith('\0virtual:@rollup/rollup-')) {
      console.log(`Providing empty module for ${id}`);
      return 'export default {};';
    }
    return null;
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
    // Handle native Rollup modules
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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    exclude: [
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-win32-x64-msvc',
      '@rollup/rollup-darwin-x64'
    ]
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
})