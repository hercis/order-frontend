import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const apiBase = process.env.VITE_API_BASE || 'https://avkbkr6gha.execute-api.mx-central-1.amazonaws.com/prod'
  const base = mode === 'production' ? (process.env.VITE_BASE || '/order/') : '/'
  return {
    base,
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          // Remove /api prefix when forwarding to the backend
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
        },
      },
    },
  }
})