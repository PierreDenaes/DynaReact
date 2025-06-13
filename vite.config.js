import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Écoute sur toutes les interfaces réseau
    port: 5173, // Port par défaut de Vite
    hmr: {
      clientPort: 443
    },
    // Autoriser tous les hosts (incluant ngrok)
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', 'localhost']
  }
})
