import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      preview: {
        host: '0.0.0.0',
        port: 8080,
        strictPort: true,
        allowedHosts: [
          'localhost',
          '.run.app',
          '.a.run.app'
        ]
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(env.GOOGLE_MAPS_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Separate React and React-DOM into their own chunk
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // Separate Google GenAI into its own chunk
              'genai-vendor': ['@google/genai'],
            },
          },
        },
        // Increase chunk size warning limit to 1000kb (from 500kb)
        chunkSizeWarningLimit: 1000,
        // Use esbuild minifier (default, faster than terser)
        minify: 'esbuild',
      },
    };
});
