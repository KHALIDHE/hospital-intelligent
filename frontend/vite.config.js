// ============================================================
// frontend/vite.config.js
// ============================================================
// Must allow external connections when running in Docker
// ============================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow connections from outside the container
    host: '0.0.0.0',
    port: 5173,
    // Poll for file changes (needed inside Docker)
    watch: {
      usePolling: true,
    },
  },
})