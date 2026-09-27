import type { LayoutLoad } from './$types'

export const prerender = true
export const trailingSlash = 'always'
export const load: LayoutLoad = async ({ url, fetch }) => {
  let res: Blog.Post[] = []
  try {
    const r = await fetch('/posts.json')
    if (r.ok) res = await r.json()
  } catch {
    res = []
  }
  return { path: url.pathname, res }
}
