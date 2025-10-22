import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    // --- Serveur local ---
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // --- Plugins ---
    plugins: [react()],

    // --- Variables d'environnement ---
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    // --- Alias import '@/...' ---
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    // --- 🔥 Ajout GitHub Pages ---
    base: '/fitgamify/',    // ⚠️ adapte ici le nom EXACT de ton repo GitHub
    build: {
      outDir: 'docs',       // dossier utilisé par GitHub Pages
    },
  };
});