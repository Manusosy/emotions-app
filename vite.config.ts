import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Determine if building for Netlify
const isNetlify = process.env.NETLIFY === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to handle Radix UI toggle dependencies
    {
      name: 'replace-radix-toggle-imports',
      resolveId(id) {
        // Replace Radix UI toggle imports with virtual empty modules
        if (id === '@radix-ui/react-toggle' || id === '@radix-ui/react-toggle-group') {
          return id;
        }
        return null;
      },
      load(id) {
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
    // Use index-netlify.html for Netlify builds if it exists
    {
      name: 'use-netlify-index',
      config(config) {
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
    },
  },
  server: {
    port: 8080,
    host: "::"
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      // Externalize dependencies that might cause platform-specific issues
      external: [
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-win32-x64-msvc'
      ]
    }
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://ekpiqiatfwozmepkgbbe.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y")
  }
})
