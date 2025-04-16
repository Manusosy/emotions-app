import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@radix-ui/react-toggle': path.resolve(__dirname, './src/components/ui/pure-toggle'),
      '@radix-ui/react-toggle-group': path.resolve(__dirname, './src/components/ui/pure-toggle-group'),
    },
  },
  server: {
    port: 8080,
    host: "::"
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    // Disable manual chunks completely to avoid dependency issues
    rollupOptions: {
      output: {
        manualChunks: undefined
      },
      // Explicitly mark these packages as external to avoid bundling issues
      external: [
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group'
      ]
    },
    // Disable minification options that could cause issues
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      }
    },
    // Don't process HTML directly
    emptyOutDir: true,
    // Configure HTML processing
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    modulePreload: true,
    reportCompressedSize: false
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || "https://ekpiqiatfwozmepkgbbe.supabase.co"),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrcGlxaWF0Zndvem1lcGtnYmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2OTc3MzYsImV4cCI6MjA1NTI3MzczNn0.qPD707Lp5FiAjlQwfC1bbG-O2WuNUe_ZYRjox6Dmb-Y")
  }
})
