/** Calls `fn` once, the first time `node` comes within `margin` of the viewport. */
export function whenNear(node: Element, fn: () => void, margin = '300px'): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    fn()
    return () => {}
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      io.disconnect()
      fn()
    },
    { rootMargin: margin }
  )
  io.observe(node)
  return () => io.disconnect()
}
