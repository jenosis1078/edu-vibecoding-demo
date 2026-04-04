import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
      'process.env.VITE_IDENTITY_POOL_ID': JSON.stringify(env.VITE_IDENTITY_POOL_ID || ''),
      'process.env.VITE_REGION': JSON.stringify(env.VITE_REGION || 'ap-northeast-2'),
    },
  };
});
