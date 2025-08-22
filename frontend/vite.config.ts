import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  // Production build configuration (Fixed)
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          forms: ['react-hook-form'],
          icons: ['lucide-react']
        }
      }
    },
    // Remove terser configuration - use default esbuild minifier
    chunkSizeWarningLimit: 1000
  },
  
  // Preview server
  preview: {
    port: 4173,
    host: true
  }
})
