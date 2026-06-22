import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// Targets old Android System WebViews (Android 5.0+ ships Chrome ~37-40,
// many devices never receive WebView updates beyond what Play Services allows).
// @vitejs/plugin-legacy emits a second, ES5-transpiled bundle + core-js
// polyfills (Promise, Object.assign, Array.from, etc.) and only serves it
// to browsers that fail the native ESM <script type="module"> check.
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Android >= 5', 'ChromeAndroid >= 39', 'iOS >= 9', 'last 4 Chrome versions'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
  ],
  build: {
    cssTarget: 'chrome61',
    minify: 'terser',
  },
});
