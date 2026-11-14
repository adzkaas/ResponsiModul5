import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SummitGear — Basecamp Logistics PWA',
        short_name: 'SummitGear',
        description: 'Aplikasi manajemen logistik dan perlengkapan ekspedisi gunung offline-first.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f4f6f4',
        theme_color: '#14261c',
        icons: [
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,webmanifest}'],
      },
    }),
  ],
})
