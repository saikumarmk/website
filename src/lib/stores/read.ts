import { readable } from 'svelte/store'
import { browser } from '$app/environment'

/** A post counts as read once its end flower has been on screen; kept in localStorage as `read:<slug>`. */
const PREFIX = 'read:'
const slugOf = (path: string) => path.replace(/^\/+|\/+$/g, '')

let push: ((s: Set<string>) => void) | undefined
let current = new Set<string>()

function scan() {
  const s = new Set<string>()
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) s.add(k.slice(PREFIX.length))
    }
  } catch {}
  return s
}

/** slugs (paths without slashes) of the posts read on this device; empty during SSR */
export const readSlugs = readable(current, set => {
  if (!browser) return
  push = s => set((current = s))
  push(scan())
  const onStorage = (e: StorageEvent) => (!e.key || e.key.startsWith(PREFIX)) && push?.(scan())
  addEventListener('storage', onStorage)
  return () => {
    removeEventListener('storage', onStorage)
    push = undefined
  }
})

export const isRead = (slugs: Set<string>, path: string) => slugs.has(slugOf(path))

export function setRead(path: string, read: boolean) {
  const slug = slugOf(path)
  try {
    if (read) localStorage.setItem(PREFIX + slug, '1')
    else localStorage.removeItem(PREFIX + slug)
  } catch {}
  const next = new Set(browser && !push ? scan() : current)
  if (read) next.add(slug)
  else next.delete(slug)
  current = next
  push?.(next)
}

/** `use:markRead={post.path}`: marks the post read when this element (the end flower) scrolls into view. */
export function markRead(node: HTMLElement, path: string) {
  let p = path
  let io: IntersectionObserver | undefined
  const arm = () => {
    io?.disconnect()
    io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io?.disconnect()
      setRead(p, true)
    })
    io.observe(node)
  }
  arm()
  return {
    update(next: string) {
      p = next
      arm()
    },
    destroy: () => io?.disconnect()
  }
}
