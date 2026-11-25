import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Saída em dist/: é essa pasta que se carrega no Chrome (Carregar sem compactação).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel/index.html',
        background: 'src/background.js'
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js'),
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][ext]'
      }
    }
  }
});
