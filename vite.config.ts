import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    watch: {
      ignored: [
        '**/database.sqlite**',
        '**/node_modules/**',
        '**/.git/**'
      ]
    },
    fs: {
      strict: false
    }
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude database files from bundling
        return id.includes('database.sqlite');
      }
    }
  }
});