import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Installable PWA (manifest + Workbox service worker).
    // The site is served from the domain root (https://yuanli-au.github.io/),
    // so scope and paths are all "/".
    VitePWA({
      // No auto-reload: a new version waits until every tab / the installed
      // app is closed, so an update can never interrupt an unsaved edit.
      registerType: 'prompt',
      injectRegister: 'script', // adds a small registerSW.js to index.html
      includeManifestIcons: false, // icons/*.png are already precached below
      manifest: {
        id: '/planner',
        name: 'Yuan Li Planner',
        short_name: 'Planner',
        description: 'Personal daily planner of Yuan Li.',
        start_url: '/planner',
        scope: '/',
        display: 'standalone',
        background_color: '#f2f4f8',
        theme_color: '#f2f4f8',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Offline app shell: HTML, CSS, JS and small icons are precached.
        globPatterns: ['**/*.{js,css,html,svg}', 'icons/*.png'],
        // The Planner chunk (Firebase) is NOT precached, so Portfolio visitors
        // never download it; it is cached the first time /planner is opened.
        // planner.html / 404.html are copies of index.html (see build script).
        globIgnores: ['**/Planner-*', 'planner.html', '404.html'],
        // Any page navigation gets the app shell; React Router picks the route.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Planner chunk: hashed file names never change → cache-first.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && /\/assets\/Planner-.*\.(js|css)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'planner-chunk',
              expiration: { maxEntries: 10 },
            },
          },
          {
            // Portfolio photos / logos: cached when first viewed, not precached.
            urlPattern: ({ url }) =>
              url.origin === self.location.origin && /\/assets\/.*\.(png|jpe?g|webp)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
        ],
        // Firebase / Google APIs are cross-origin and not matched above, so
        // they always go straight to the network (Firebase SDK handles them).
      },
    }),
  ],
})
