import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Create a mock module for platform-specific Rollup dependencies
const createMockModule = () => 'export default {};';

// More robust handling of missing Rollup binaries
const handleNativeRollupPlugin = {
  name: 'handle-native-rollup',
  resolveId(id: string) {
    if (id.includes('@rollup/rollup-')) {
      return '\0virtual:' + id;
    }
    return null;
  },
  load(id: string) {
    if (id.startsWith('\0virtual:@rollup/rollup-')) {
      return createMockModule();
    }
    return null;
  }
};

// Plugin to handle platform-specific dependencies
const platformSpecificPlugin = {
  name: 'platform-specific-deps',
  resolveId(id: string) {
    if (id.includes('@rollup/rollup-linux-x64-gnu')) {
      return '\0virtual:rollup-linux';
    }
    return null;
  },
  load(id: string) {
    if (id === '\0virtual:rollup-linux') {
      return createMockModule();
    }
    return null;
  }
};

// Check for fallback module
const rollupFallbackPath = path.resolve(__dirname, 'src/rollup-fallback.js');
if (!fs.existsSync(rollupFallbackPath)) {
  console.warn('Rollup fallback module not found at ' + rollupFallbackPath);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    handleNativeRollupPlugin
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@supabase/supabase-js'
          ]
        }
      }
    }
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://ekpiqiatfwozmepkgbbe.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y")
  }
});
