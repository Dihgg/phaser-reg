import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    createHtmlPlugin(),
    tsconfigPaths(),
  ],
});
