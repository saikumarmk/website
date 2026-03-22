// vite define config
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
// vite plugin
import UnoCSS from 'unocss/vite'
import { presetTagify, presetIcons } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'
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
/**
 * Mirror `urara/` → `src/routes/` + `static/` before SvelteKit resolves `import.meta.glob` for posts.
 * Without this, `pnpm build` (which runs `clean` at the end) leaves no `+page.md` copies and dev shows 0 posts.
 */
let uraraMirrorRan = false
function runUraraMirror() {
  if (process.env.VITE_SKIP_URARA_MIRROR === '1') return
  if (uraraMirrorRan) return
  uraraMirrorRan = true
  try {
    execSync('node urara.js build', { stdio: 'inherit', cwd: process.cwd() })
  } catch {
    console.error('[urara-mirror] node urara.js build failed — posts may be empty until this succeeds.')
    throw new Error('urara.js build failed')
  }
}

function uraraMirrorPlugin() {
  return {
    name: 'urara-mirror',
    enforce: 'pre' as const,
    /** Dev server: mirror before any glob-based post scan */
    configureServer() {
      runUraraMirror()
    },
    /** `vite build` (no configureServer) */
    buildStart() {
      runUraraMirror()
    }
  }
}

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
          // Split large libraries into separate chunks
          if (id.includes('node_modules')) {
            // Let mermaid be handled naturally by Rollup to avoid Firefox TDZ issues
            if (id.includes('mermaid')) return undefined
            if (id.includes('elkjs')) return 'elk'
            if (id.includes('three')) return 'three'
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
    uraraMirrorPlugin(),
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
