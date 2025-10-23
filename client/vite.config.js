import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This forwards all requests starting with /api
      // to your backend server running on port 5000
      '/api': {
        target: 'http://localhost:3000', // Your backend server URL
        changeOrigin: true, // Recommended for this to work
      },
    },
  },
});
