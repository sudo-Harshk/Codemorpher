import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  server: {
    port: 5173,
    proxy: {
      '/translate': 'http://localhost:5000',
      '/upload': 'http://localhost:5000',
      '/history': 'http://localhost:5000',
      '/ping': 'http://localhost:5000',
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});

