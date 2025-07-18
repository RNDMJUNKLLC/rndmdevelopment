import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    // Enable minification for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['firebase', '@emailjs/browser'],
          ui: ['./src/main.js'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Source maps for production debugging
    sourcemap: false,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  server: {
    // Enable compression for dev server
    compress: true,
  },
  // Optimize images and assets
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore', '@emailjs/browser'],
  },
})
