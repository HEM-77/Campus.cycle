import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Remove HTTPS for local development to prevent certificate issues
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})