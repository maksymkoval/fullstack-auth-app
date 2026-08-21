import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфіг Vite. Dev-сервер піднімається на :5173.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
