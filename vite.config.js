// Configuració de Vite per al joc Phaser 3
// Serveix els assets estàtics i genera el build de producció per a Netlify
import { defineConfig } from 'vite';

export default defineConfig({
  // Base relativa per a desplegaments en subdirectoris (Netlify)
  base: './',
  build: {
    // Directori de sortida per al build de producció
    outDir: 'dist',
    // Genera sourcemaps per a depuració
    sourcemap: false,
    rollupOptions: {
      output: {
        // Organitza els assets del build
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    }
  },
  server: {
    // Port del servidor de desenvolupament
    port: 8080,
    open: true
  }
});
