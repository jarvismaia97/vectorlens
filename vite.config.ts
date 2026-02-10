import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3200,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/query': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/sync': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/store': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/sources': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/timeline': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/duplicates': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/delete': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/graph': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      },
      '/collections': {
        target: 'http://localhost:3201',
        changeOrigin: true,
      }
    }
  }
})
