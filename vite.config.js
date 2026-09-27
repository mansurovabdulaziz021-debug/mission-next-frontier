import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api/nasa': {
        target: 'https://ssd.jpl.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nasa/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 1500
  }
});
