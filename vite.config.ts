// vite define config
import { defineConfig } from 'vitest/config'
import type { ViteDevServer } from 'vite'
// vite plugin
import UnoCSS from 'unocss/vite'
import { presetTagify, presetIcons } from 'unocss'
import heroiconsOutline from '@iconify-json/heroicons-outline/icons.json' with { type: 'json' }
import heroiconsSolid from '@iconify-json/heroicons-solid/icons.json' with { type: 'json' }
import extractorSvelte from '@unocss/extractor-svelte'
import { imagetools } from 'vite-imagetools'
import { sveltekit as SvelteKit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
// postcss & tailwindcss
import TailwindCSS from 'tailwindcss'
import tailwindConfig from './tailwind.config.ts'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import path from 'path'
/** Annotated-code posts fetch their source from static/annotations at runtime, so reload when one changes. */
function reloadOnAnnotations() {
  return {
    name: 'reload-on-annotations',
    configureServer(server: ViteDevServer) {
      const dir = path.resolve('static/annotations')
      server.watcher.add(dir)
      server.watcher.on('change', file => {
        if (file.startsWith(dir)) server.ws.send({ type: 'full-reload' })
      })
    }
  }
}

export default defineConfig({
  envPrefix: 'SITE_',
  test: {
    include: ['src/**/*.test.ts']
  },
  /**
   * mdsvex emits `import Layout, * as Components from 'src/lib/components/post_layout.svelte'`.
   * Without this alias Rollup treats it as an unresolved bare import; with it, layout + namespace
   * bind consistently on client and server (fixes ReferenceError: SlabTitle is not defined in MD pages).
   */
  resolve: {
    alias: {
      'src/lib': path.resolve('./src/lib')
    }
  },
  /** Single dev port — if 5173 is busy, fail fast instead of silently using 5174+ */
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      // Rollup cache enabled (default); disabling was likely a workaround — re-enable for faster rebuilds
      output: {
        manualChunks(id) {
          // Split large libraries into separate chunks. No catch-all vendor chunk: it would pull the
          // dependencies of lazily imported libraries (mermaid's d3, cytoscape, dayjs…) into every page.
          if (id.includes('node_modules')) {
            if (id.includes('force-graph')) return 'force-graph-2d'
            if (id.includes('svelte')) return 'svelte-vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  css: {
    postcss: {
      plugins: [
        TailwindCSS(tailwindConfig as any) as any,
        autoprefixer() as any,
        ...(process.env.NODE_ENV === 'production'
          ? [
              cssnano({
                preset: ['default', { discardComments: { removeAll: true } }]
              }) as any
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
        presetIcons({
          scale: 1.5,
          collections: {
            'heroicons-outline': () => heroiconsOutline as any,
            'heroicons-solid': () => heroiconsSolid as any
          }
        })
      ]
    } as any),
    imagetools(),
    SvelteKit(),
    reloadOnAnnotations(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: false,
      // Vite's base is './' (SvelteKit's relative paths), which registered ./sw.js relative to each page
      base: '/',
      scope: '/',
      kit: { trailingSlash: 'always' },
      workbox: {
        // Precache only the home page and entry scripts. Other pages and assets are
        // cached when visited, so installing the worker does not fetch the whole site.
        navigateFallback: undefined,
        globPatterns: [
          'prerendered/pages/index.html',
          'prerendered/pages/manifest.webmanifest',
          'client/_app/immutable/entry/*.js'
        ],
        globIgnores: ['**/sw*', '**/workbox-*'],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === 'navigate' && url.origin === self.location.origin && !url.pathname.startsWith('/assets/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.origin === self.location.origin &&
              (url.pathname.startsWith('/_app/immutable/') || url.pathname === '/search-index.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-assets',
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          },
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
