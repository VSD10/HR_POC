import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware to serve exact files directly from the root resources/ directory
function serveResourcesPlugin() {
  const resourcesDir = path.resolve(__dirname, '../../resources')
  return {
    name: 'serve-resources-folder',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && (req.url.startsWith('/resources/') || req.url.startsWith('/policies/'))) {
          const urlPath = req.url.split('?')[0].split('#')[0]
          const filename = path.basename(urlPath)
          const filePath = path.join(resourcesDir, filename)
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
            fs.createReadStream(filePath).pipe(res)
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveResourcesPlugin()],
  server: {
    proxy: {
      '/api/chat': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/gmail': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
