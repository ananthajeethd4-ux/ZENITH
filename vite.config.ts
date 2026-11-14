import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { telemetrySyncApiPlugin } from './server/telemetrySyncPlugin';

export default defineConfig({
  plugins: [react(), telemetrySyncApiPlugin()],
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
});