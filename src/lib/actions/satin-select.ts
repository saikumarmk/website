export interface SatinSelectOptions {
  /** selector for the items the bar can sit on, relative to the node */
  items: string
  /** index the bar returns to when the pointer and focus leave; -1 hides it */
  selected?: number
  /** change this when the items are re-rendered to re-seat the bar even while hovered */
  key?: unknown
}

/**
 * Moves one stitched `.sel-bar` to the hovered, focused or selected item.
 * Used by lists, tabs, the post contents, search results and the Dex list.
 */
export function satinSelect(node: HTMLElement, options: SatinSelectOptions) {
  let opts = options
  let idx = -1
  node.classList.add('menu')
  let bar = node.querySelector<HTMLElement>(':scope > .sel-bar')
  if (!bar) {
    bar = document.createElement('div')
    bar.className = 'sel-bar'
    bar.setAttribute('aria-hidden', 'true')
    node.prepend(bar)
  }
  const items = () => [...node.querySelectorAll<HTMLElement>(opts.items)]

  function select(i: number) {
    const its = items()
    its.forEach(el => el.classList.remove('is-sel'))
    idx = i
    const el = its[i]
    if (i < 0 || !el) {
      node.classList.remove('has-sel')
      return
    }
    const rr = node.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    el.classList.add('is-sel')
    node.classList.add('has-sel')
    bar!.style.transform = `translate(${r.left - rr.left}px, ${r.top - rr.top}px)`
    bar!.style.height = `${r.height}px`
    bar!.style.width = `${r.width}px`
  }
  const rest = () => select(opts.selected ?? -1)
  const pick = (e: Event) => {
    const el = (e.target as Element).closest<HTMLElement>(opts.items)
    if (el && node.contains(el)) select(items().indexOf(el))
  }
  const onResize = () => idx >= 0 && select(idx)

  node.addEventListener('pointerover', pick)
  node.addEventListener('pointerleave', rest)
  node.addEventListener('focusin', pick)
  node.addEventListener('focusout', rest)
  addEventListener('resize', onResize)
  requestAnimationFrame(rest)

  return {
    update(next: SatinSelectOptions) {
      const moved = next.selected !== opts.selected
      const rekeyed = next.key !== opts.key
      opts = next
      if (rekeyed) requestAnimationFrame(rest)
      else if (moved && !node.matches(':hover, :focus-within')) rest()
    },
    destroy() {
      node.removeEventListener('pointerover', pick)
      node.removeEventListener('pointerleave', rest)
      node.removeEventListener('focusin', pick)
      node.removeEventListener('focusout', rest)
      removeEventListener('resize', onResize)
    }
  }
}
