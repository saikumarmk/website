import { Builder } from './builder'

export type Compose<T> = (b: Builder, width: number, height: number) => T

export interface Rendered<T> {
  /** inner SVG markup, safe to inline during SSR */
  html: string
  result: T
  /** ms until the last stitch lands, at this speed */
  duration: number
}

/** Pure: the same compose and size give byte-identical markup, on the server or in the browser. */
export function render<T>(compose: Compose<T>, width: number, height: number, speed = 1): Rendered<T> {
  const b = new Builder(speed)
  const result = compose(b, width, height)
  return { html: `<g class="thread">${b}</g>`, result, duration: Math.round(b.clock / speed) }
}

export interface SewOptions {
  duration: number
  /** play only when a `thread:resew` event is dispatched on the SVG */
  manual?: boolean
}

/**
 * Svelte action: sews the piece once it's on screen, then swaps the finished CSS animations for the
 * static `.sewn` state so large pieces don't hold thousands of animations.
 * Until then `html.js .thread-svg` hides the stitches (styles/sampler.css); without JS, or with
 * reduced motion, the finished piece shows.
 */
export function sew(svg: SVGSVGElement, opts: SewOptions) {
  let o = opts
  let timer: ReturnType<typeof setTimeout> | undefined
  let io: IntersectionObserver | undefined

  const play = () => {
    svg.classList.remove('sew', 'sewn')
    void svg.getBoundingClientRect()
    svg.classList.add('sew')
    clearTimeout(timer)
    timer = setTimeout(() => {
      svg.classList.add('sewn')
      svg.classList.remove('sew')
    }, o.duration + 700)
  }
  const arm = () => {
    io?.disconnect()
    clearTimeout(timer)
    svg.classList.remove('sew', 'sewn')
    if (o.manual) return
    io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io?.disconnect()
        play()
      },
      { threshold: 0.15 }
    )
    io.observe(svg)
  }

  arm()
  svg.addEventListener('thread:resew', play)

  return {
    update(next: SewOptions) {
      o = next
      arm()
    },
    destroy() {
      io?.disconnect()
      clearTimeout(timer)
      svg.removeEventListener('thread:resew', play)
    }
  }
}
