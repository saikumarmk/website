// sveltekit config type
import type { Config } from '@sveltejs/kit'
// svelte adapter
import adapterAuto from '@sveltejs/adapter-auto'
import adapterNode from '@sveltejs/adapter-node'
import adapterStatic from '@sveltejs/adapter-static'
// svelte preprocessor
import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import importAssets from 'svelte-preprocess-import-assets'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const defineConfig = (config: Config) => config

export default defineConfig({
  extensions: ['.svelte', ...(mdsvexConfig.extensions as string[])],
  preprocess: [mdsvex(mdsvexConfig), importAssets(), vitePreprocess()],
  kit: {
    adapter: Object.keys(process.env).some(key => ['VERCEL', 'NETLIFY'].includes(key))
      ? adapterAuto()
      : process.env.ADAPTER === 'node'
      ? adapterNode({ out: 'build' })
      : adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: undefined,
          // growth/2026/[id] is dynamic (prerender = false); required for static export without platform env (e.g. local build, CI)
          strict: false
        }),
    prerender: {
      handleMissingId: 'warn'
    },
    csp: { mode: 'auto' }
  }
})
