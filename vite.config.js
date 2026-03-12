import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/ai': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            const model = "gemini-3-flash-preview"; // Latest stable fallback
            const action = path.replace(/^\/api\/ai\/?/, '') || 'generateContent';
            return `/v1beta/models/${model}:${action}?key=${env.VITE_GEMINI_API_KEY}`;
          },
        },
      },
    },
  }
})
