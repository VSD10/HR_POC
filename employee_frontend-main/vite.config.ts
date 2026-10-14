import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to serve exact files directly from the root resources/ directory
function serveResourcesPlugin() {
  const resourcesDir = path.resolve(__dirname, '../resources');
  return {
    name: 'serve-resources-folder',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && (req.url.startsWith('/resources/') || req.url.startsWith('/policies/'))) {
          const urlPath = req.url.split('?')[0].split('#')[0];
          const filename = path.basename(urlPath);
          const filePath = path.join(resourcesDir, filename);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveResourcesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/chat': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          headers: {
            'x-portal-origin': 'employee-portal-3000'
          }
        },
        '/api/v1': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          headers: {
            'x-portal-origin': 'employee-portal-3000'
          }
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
