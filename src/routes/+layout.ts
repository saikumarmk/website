import type { LayoutLoad } from './$types'
import { dev } from '$app/environment'

export const prerender = true
export const trailingSlash = 'always'
export const load: LayoutLoad = async ({ url, fetch }) => {
  let res: Urara.Post[] = []
  try {
    const r = await fetch('/posts.json')
    if (r.ok) {
      res = await r.json()
      if (dev && Array.isArray(res) && res.length === 0) {
        console.warn(
          '[layout] posts.json is empty: mirrored +page.md is missing under src/routes (ignored in git). ' +
            'Run `pnpm urara:build` or restart `pnpm dev` (Vite mirrors urara/ on startup). ' +
            '`pnpm install` runs prepare, which mirrors after compiling urara.js.'
        )
      }
    }
  } catch {
    res = []
  }
  return { path: url.pathname, res }
}
