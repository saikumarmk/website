// vite define config
import { defineConfig } from 'vite'
// vite plugin
import UnoCSS from 'unocss/vite'
import { presetTagify, presetIcons, extractorSvelte } from 'unocss'
import { imagetools } from 'vite-imagetools'
import { sveltekit as SvelteKit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
// postcss & tailwindcss
import TailwindCSS from 'tailwindcss'
import tailwindConfig from './tailwind.config'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import fs from 'fs'
import path from 'path'
function watchExtraFiles() {
  return {
    name: 'watch-extra-files',
    configureServer(server) {
      const fileToWatch = path.resolve('./urara/annotations/elo_calculator.py') // 👈 update path
      fs.watch(fileToWatch, () => {
        console.log(`[watch-extra-files] File changed: ${fileToWatch}`)
        server.ws.send({ type: 'full-reload' })
      })
    }
  }
}

export default defineConfig({
  envPrefix: 'URARA_',
  build: {
    sourcemap: false,
    rollupOptions: {
      cache: false,
      output: {
        manualChunks(id) {
          // Split large libraries into separate chunks
          if (id.includes('node_modules')) {
            // Let mermaid be handled naturally by Rollup to avoid Firefox TDZ issues
            if (id.includes('mermaid')) return undefined
            if (id.includes('elkjs')) return 'elk'
            if (id.includes('three')) return 'three'
            if (id.includes('force-graph') && id.includes('3d')) return 'force-graph-3d'
            if (id.includes('force-graph')) return 'force-graph-2d'
            if (id.includes('d3')) return 'd3'
            if (id.includes('katex')) return 'katex'
            if (id.includes('svelte')) return 'svelte-vendor'
            // Other node_modules go to common vendor chunk
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  css: {
    postcss: {
      plugins: [
        TailwindCSS(tailwindConfig),
        autoprefixer(),
        ...(process.env.NODE_ENV === 'production'
          ? [
            cssnano({
              preset: ['default', { discardComments: { removeAll: true } }]
            })
          ]
          : [])
      ]
    }
  },
  plugins: [
    UnoCSS({
      include: [/\.svelte$/, /\.md?$/, /\.ts$/],
      extractors: [extractorSvelte],
      presets: [
        presetTagify({
          extraProperties: (matched: string) => (matched.startsWith('i-') ? { display: 'inline-block' } : {})
        }),
        presetIcons({ scale: 1.5 })
      ]
    }),
    imagetools(),
    SvelteKit(),
    watchExtraFiles(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: false,
      scope: '/',
      workbox: {
        // Increase precache limit for large chunks
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
        // Don't precache large images/files
        globPatterns: ['posts.json', '**/*.{js,css,html,svg,ico}'],
        globIgnores: ['**/sw*', '**/workbox-*'],
        // Runtime caching for images
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
})
