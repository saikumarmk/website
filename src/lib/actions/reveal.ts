import { browser } from '$app/environment'

export type RevealOptions = {
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'none'
  delay?: number
  duration?: number
  distance?: number
  threshold?: number
  once?: boolean
}

const defaults: Required<RevealOptions> = {
  direction: 'up',
  delay: 0,
  duration: 600,
  distance: 30,
  threshold: 0.15,
  once: true
}

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  if (!browser) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const opts = { ...defaults, ...options }

  const transform = {
    up: `translateY(${opts.distance}px)`,
    down: `translateY(-${opts.distance}px)`,
    left: `translateX(${opts.distance}px)`,
    right: `translateX(-${opts.distance}px)`,
    scale: `scale(0.92)`,
    none: 'none'
  }[opts.direction]

  node.style.opacity = '0'
  node.style.transform = transform
  node.style.transition = `opacity ${opts.duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${opts.delay}ms, transform ${opts.duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${opts.delay}ms`
  node.style.willChange = 'opacity, transform'

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.style.opacity = '1'
          node.style.transform = 'none'
          if (opts.once) observer.disconnect()
        } else if (!opts.once) {
          node.style.opacity = '0'
          node.style.transform = transform
        }
      }
    },
    { threshold: opts.threshold }
  )

  observer.observe(node)

  return {
    destroy() {
      observer.disconnect()
      node.style.willChange = ''
    },
    update(newOptions: RevealOptions) {
      Object.assign(opts, { ...defaults, ...newOptions })
    }
  }
}

export function staggerReveal(node: HTMLElement, options: { selector?: string; staggerMs?: number; direction?: RevealOptions['direction'] } = {}) {
  if (!browser) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { selector = ':scope > *', staggerMs = 80, direction = 'up' } = options
  const children = Array.from(node.querySelectorAll(selector)) as HTMLElement[]

  const cleanups: (() => void)[] = []

  children.forEach((child, i) => {
    const cleanup = reveal(child, {
      direction,
      delay: i * staggerMs,
      distance: 24,
      duration: 500
    })
    if (cleanup) cleanups.push(cleanup.destroy)
  })

  return {
    destroy() {
      cleanups.forEach(fn => fn())
    }
  }
}
