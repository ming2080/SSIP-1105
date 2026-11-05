import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

const serveYxkjPlugin = () => ({
  name: 'serve-yxkj-html',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && req.url.includes('yxkj-')) {
        const match = req.url.match(/yxkj-v\d+\.html/);
        if (match) {
          const fileName = match[0];
          const possiblePaths = [
            path.resolve(__dirname, 'src', fileName),
            path.resolve(__dirname, 'public', fileName),
            path.resolve(__dirname, 'public', 'src', fileName),
          ];
          for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.end(fs.readFileSync(p));
              return;
            }
          }
        }
      }
      next();
    });
  }
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serveYxkjPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

