import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = import.meta.env.VITE_API_URL;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'API_URL',
        changeOrigin: true
      },
      '/uploads': {
        target: `${API_URL}/uploads/${imageName}`,
        changeOrigin: true
      }
    }
  }
});
