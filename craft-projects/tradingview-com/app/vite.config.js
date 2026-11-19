import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chart: resolve(__dirname, 'chart/index.html'),
        ideas: resolve(__dirname, 'ideas/index.html'),
        markets: resolve(__dirname, 'markets/index.html'),
        brokers: resolve(__dirname, 'brokers/index.html'),
      },
    },
  },
});
