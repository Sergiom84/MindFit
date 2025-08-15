/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // lee variables de .env (p. ej., VITE_API_URL=http://localhost:5000)
  const env = loadEnv(mode, process.cwd(), '');
  const target = (env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      rollupOptions: {
        external: [],
        output: {
          manualChunks: undefined,
        }
      },
      target: 'esnext',
      minify: 'esbuild',
    },
    server: {
      proxy: {
        '/api': {
          target,           // <- http://localhost:5000 (o lo que tengas en .env)
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: env.PORT || 4173,
      allowedHosts: ['mindfit.onrender.com'],
    },
  };
});
