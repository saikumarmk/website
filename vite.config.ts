// vite define config
import { defineConfig, type ViteDevServer } from 'vite'
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
            if (id.includes('elkjs')) return 'elk'
            if (id.includes('three')) return 'three'
            if (id.includes('force-graph')) return 'force-graph-2d'
            if (id.includes('katex')) return 'katex'
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
        // Increase precache limit for large chunks
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB
        // Don't precache large images/files
        globPatterns: ['posts.json', '**/*.{js,css,html,svg,ico}'],
        globIgnores: ['**/sw*', '**/workbox-*'],
        // Never serve the SPA shell for PDFs under /assets/ (breaks ./_app relative URLs)
        navigateFallbackDenylist: [/^\/assets\/.*\.pdf$/i],
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
