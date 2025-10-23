import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Sécurise les valeurs: si non définies => chaîne vide
  const GEMINI = env.GEMINI_API_KEY ?? '';

  return {
    server: { port: 3000, host: '0.0.0.0' },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(GEMINI),
      'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    // GitHub Pages
    base: '/fitgamify/',   // nom EXACT du repo
    build: { outDir: 'docs' },
  };
});
