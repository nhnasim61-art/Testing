import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const r = (p) => resolve(import.meta.dirname, p);

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: r('index.html'),
        browse: r('browse/index.html'),
        search: r('search/index.html'),
        series: r('series/index.html'),
        watch: r('watch/index.html'),
        watchlist: r('watchlist/index.html'),
      },
    },
  },
});
