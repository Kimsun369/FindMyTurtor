import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: path.resolve(dirname, 'frontend'),
  plugins: [react()],
  // Three.js is loaded by the lazy staircase module. Include it explicitly so
  // Vite's dependency optimizer resolves it consistently from the repo root.
  optimizeDeps: { include: ['three'] },
  server: {
    port: Number(process.env.VITE_PORT) || 5173,
    proxy: { '/api': 'http://localhost:4000', '/uploads': 'http://localhost:4000' },
  },
  build: { outDir: path.resolve(dirname, 'backend/public'), emptyOutDir: true },
})
