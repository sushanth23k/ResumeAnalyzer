import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, very cache-friendly
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Rich-text editor (large — isolate it)
          'vendor-quill': ['react-quill'],
          // Document-generation libraries (heaviest — each gets its own chunk)
          'vendor-pdf': ['jspdf'],
          'vendor-docx': ['docx', 'file-saver'],
          // Canvas / sanitize utilities
          'vendor-canvas': ['html2canvas'],
          'vendor-sanitize': ['dompurify'],
        },
      },
    },
  },
})
