import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for production builds
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginalAssets: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        // Each entry produces a separate HTML file (true MPA).
        // Subdirectories give clean URLs: /about/, /services/, etc.
        main: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about/index.html'),
        services: path.resolve(__dirname, 'services/index.html'),
        contact: path.resolve(__dirname, 'contact/index.html'),
        token: path.resolve(__dirname, 'token/index.html'),
        account: path.resolve(__dirname, 'account/index.html'),
      },
    },
  },
  envPrefix: 'VITE_',
})
