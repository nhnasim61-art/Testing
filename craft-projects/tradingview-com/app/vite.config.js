import { defineConfig } from 'vite';
import { resolve } from 'path';

// Set BASE_PATH (e.g. "/Testing/") when the site is served from a sub-path, as on GitHub Pages.
const base = process.env.BASE_PATH || '/';

// Page links like "/chart/" or href="/" are written root-absolute in the HTML and JS;
// prefix them with the base path so they keep working under a sub-path.
const pageLink = /(["'`=(]\s*)\/(chart|ideas|markets|brokers)\//g;
const homeLink = /(href=["'])\/(["'])/g;
function prefixPageLinks() {
  const fix = (code) =>
    code.replace(pageLink, `$1${base}$2/`).replace(homeLink, `$1${base}$2`);
  return {
    name: 'prefix-page-links',
    apply: 'build',
    transform(code, id) {
      if (base === '/' || !/\/src\/.*\.js$/.test(id)) return null;
      return { code: fix(code), map: null };
    },
    transformIndexHtml(html) {
      return base === '/' ? html : fix(html);
    },
  };
}

export default defineConfig({
  base,
  plugins: [prefixPageLinks()],
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
