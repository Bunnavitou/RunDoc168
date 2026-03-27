import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    host: true,
    // Proxy API calls to backend in dev — avoids CORS
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Smaller, faster chunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libs into separate cached chunks
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor':     ['lucide-react'],
          'state-vendor':  ['zustand'],
          'excel-vendor':  ['xlsx'],
        },
      },
    },
    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
    // Enable source maps only in dev
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
  },

  // Pre-bundle deps for faster cold starts in dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'lucide-react'],
  },
})
