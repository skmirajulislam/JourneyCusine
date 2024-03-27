import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Written by Aishiki
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
})

