const WIDE = '.post-prose > .codewrap, .post-prose > pre.shiki, .post-prose > figure, .post-prose > .wide, figure.plate'
const NOTES = '.sn, aside.note'

/**
 * Margin notes stay beside their reference. Anything wide that would run into one is pushed down,
 * and a note that would start inside a wide block moves below it. Desktop only (60rem and up).
 */
export function settleMargins(node: HTMLElement) {
  let raf = 0

  function settle() {
    const wide = [...node.querySelectorAll<HTMLElement>(WIDE)]
    const notes = [...node.querySelectorAll<HTMLElement>(NOTES)]
    wide.forEach((el) => (el.style.marginTop = ''))
    notes.forEach((n) => (n.style.transform = ''))
    if (!matchMedia('(min-width: 60rem)').matches) return
    const live = notes.filter((n) => n.offsetParent)
    for (const el of wide) {
      if (!el.offsetParent) continue
      let r = el.getBoundingClientRect()
      let need = 0
      for (const n of live) {
        const q = n.getBoundingClientRect()
        if (q.top < r.top + 4 && q.bottom + 18 > r.top) need = Math.max(need, q.bottom + 18 - r.top)
      }
      if (need) el.style.marginTop = `${parseFloat(getComputedStyle(el).marginTop) + need}px`
      r = el.getBoundingClientRect()
      for (const n of live) {
        const q = n.getBoundingClientRect()
        if (q.top >= r.top - 4 && q.top < r.bottom + 12) n.style.transform = `translateY(${r.bottom + 14 - q.top}px)`
      }
    }
  }
  const soon = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(settle)
  }
  const onLoad = (e: Event) => (e.target as Element).tagName === 'IMG' && soon()

  soon()
  document.fonts?.ready.then(soon)
  addEventListener('resize', soon)
  node.addEventListener('load', onLoad, true)
  const ro = new ResizeObserver(soon)
  ro.observe(node)

  return {
    destroy() {
      cancelAnimationFrame(raf)
      removeEventListener('resize', soon)
      node.removeEventListener('load', onLoad, true)
      ro.disconnect()
    }
  }
}
