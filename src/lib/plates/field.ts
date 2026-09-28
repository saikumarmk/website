/*
  ASCII field: particles (or a plate) splat brightness into a character grid, the grid decays each
  frame (trails), and brightness picks a glyph from a ramp. Colours come from --c1..--c3 on the canvas.

  Modes
    attractors  three drifting attractors plus the pointer (the old About page's field)
    plate       delegates to a Plate from $lib/plates (the home page's figures from posts)
*/
import type { Grid, Plate } from './types'

export interface FieldOptions {
  mode: 'attractors' | 'plate'
  plate?: Plate
  count?: number
  decay?: number
  gain?: number
  ramp?: string
  font?: string
  fontSize?: number
  lineH?: number
  fps?: number
  spread?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  hue: number
}

function hexToRgb(h: string): [number, number, number] {
  h = (h || '#888').trim().replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function createField(canvas: HTMLCanvasElement, options: FieldOptions) {
  const o = {
    count: 700,
    decay: 0.78,
    gain: 2.2,
    ramp: ' .·:-=+*#%@',
    font: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 13,
    lineH: 15,
    fps: 30,
    spread: 0.3,
    ...options
  }
  const ctx = canvas.getContext('2d')!
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let W = 0,
    H = 0,
    cols = 0,
    rows = 0,
    charW = 7.8
  let B: Float32Array | undefined,
    Hu = new Float32Array(),
    Wt = new Float32Array()
  let particles: Particle[] = []
  let colors: [number, number, number][] = [
    [194, 175, 245],
    [132, 203, 211],
    [233, 155, 198]
  ]
  let running = !reduced
  let visible = true
  let raf = 0,
    last = 0,
    simT = 0
  let destroyed = false
  const pointer = { x: -1e4, y: -1e4 }

  const readColors = () => {
    const cs = getComputedStyle(canvas)
    colors = ['--c1', '--c2', '--c3'].map(v => hexToRgb(cs.getPropertyValue(v)))
  }

  const colorAt = (h: number) => {
    h = Math.max(0, Math.min(2, h))
    const i = Math.min(1, Math.floor(h)),
      f = h - i
    const a = colors[i],
      b = colors[i + 1]
    return `rgb(${(a[0] + (b[0] - a[0]) * f) | 0},${(a[1] + (b[1] - a[1]) * f) | 0},${(a[2] + (b[2] - a[2]) * f) | 0})`
  }

  function splat(x: number, y: number, amt: number, hue: number) {
    const c = (x / charW) | 0,
      r = (y / o.lineH) | 0
    if (!B || c < 0 || r < 0 || c >= cols || r >= rows) return
    const i = r * cols + c
    B[i] += amt
    Hu[i] += hue * amt
    Wt[i] += amt
    if (o.spread > 0) {
      const s = amt * o.spread
      if (c > 0) {
        B[i - 1] += s
        Hu[i - 1] += hue * s
        Wt[i - 1] += s
      }
      if (c < cols - 1) {
        B[i + 1] += s
        Hu[i + 1] += hue * s
        Wt[i + 1] += s
      }
    }
  }

  const grid: Grid = {
    get W() {
      return W
    },
    get H() {
      return H
    },
    get cols() {
      return cols
    },
    get rows() {
      return rows
    },
    get charW() {
      return charW
    },
    get lineH() {
      return o.lineH
    },
    pointer,
    splat,
    cell: (c, r, amt, hue) => splat((c + 0.5) * charW, (r + 0.5) * o.lineH, amt, hue),
    line(x0, y0, x1, y1, amt, hue) {
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, ((y1 - y0) * charW) / o.lineH) / charW))
      for (let i = 0; i <= n; i++) splat(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, amt, hue)
    }
  }

  function setup() {
    particles = []
    if (o.mode === 'plate') return o.plate?.init(grid)
    for (let i = 0; i < o.count; i++) {
      const a = Math.random() * 6.283,
        r = Math.random() * 60 + 15
      particles.push({
        x: W / 2 + Math.cos(a) * r,
        y: H / 2 + Math.sin(a) * r,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        hue: Math.random() * 2
      })
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return
    const dpr = Math.min(devicePixelRatio || 1, 2)
    W = r.width
    H = r.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `${o.fontSize}px ${o.font}`
    charW = ctx.measureText('M').width || 7.8
    cols = Math.ceil(W / charW)
    rows = Math.ceil(H / o.lineH)
    B = new Float32Array(cols * rows)
    Hu = new Float32Array(cols * rows)
    Wt = new Float32Array(cols * rows)
    setup()
  }

  function stepAttractors(t: number) {
    const cx = W / 2,
      cy = H / 2
    const at = [
      { x: Math.cos(t * 0.0005) * W * 0.3 + cx, y: Math.sin(t * 0.0008) * H * 0.3 + cy, f: 0.18, h: 0 },
      { x: Math.sin(t * 0.0003) * W * 0.35 + cx, y: Math.cos(t * 0.0006) * H * 0.35 + cy, f: 0.15, h: 1 },
      { x: Math.cos(t * 0.0009 + 2) * W * 0.2 + cx, y: Math.sin(t * 0.0004 + 2) * H * 0.25 + cy, f: 0.12, h: 2 }
    ]
    if (pointer.x > -1e3) at.push({ x: pointer.x, y: pointer.y, f: 0.1, h: 1 })
    for (const p of particles) {
      let best = at[0],
        bd = Infinity
      for (const a of at) {
        const d = (a.x - p.x) ** 2 + (a.y - p.y) ** 2
        if (d < bd) {
          bd = d
          best = a
        }
      }
      const dx = best.x - p.x,
        dy = best.y - p.y,
        dist = Math.sqrt(bd) + 1
      p.vx += (dx / dist) * best.f + (Math.random() - 0.5) * 0.2
      p.vy += (dy / dist) * best.f + (Math.random() - 0.5) * 0.2
      const curl = Math.sin(t * 0.001 + p.x * 0.02) * 0.15
      p.vx += (-dy / dist) * curl
      p.vy += (dx / dist) * curl
      p.vx *= 0.965
      p.vy *= 0.965
      p.x += p.vx
      p.y += p.vy
      p.hue += (best.h - p.hue) * 0.05
      if (p.x < -16) p.x += W + 32
      if (p.x > W + 16) p.x -= W + 32
      if (p.y < -16) p.y += H + 32
      if (p.y > H + 16) p.y -= H + 32
      splat(p.x, p.y, 0.8, p.hue)
    }
    for (const a of at) splat(a.x, a.y, 2, a.h)
  }

  function step(t: number) {
    if (!B) return
    for (let i = 0; i < B.length; i++) {
      B[i] *= o.decay
      Hu[i] *= o.decay
      Wt[i] *= o.decay
    }
    if (o.mode === 'plate') o.plate?.step(t, grid)
    else stepAttractors(t)
  }

  function draw() {
    if (!B) return
    ctx.clearRect(0, 0, W, H)
    ctx.font = `${o.fontSize}px ${o.font}`
    ctx.textBaseline = 'top'
    const ramp = o.ramp,
      n = ramp.length - 1
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c,
          b = B[i]
        if (b < 0.06) continue
        const v = Math.min(1, b / o.gain)
        ctx.globalAlpha = 0.3 + 0.7 * v
        ctx.fillStyle = colorAt(Hu[i] / (Wt[i] || 1))
        ctx.fillText(ramp[Math.max(1, Math.min(n, Math.round(v * n)))], c * charW, r * o.lineH)
      }
    }
    ctx.globalAlpha = 1
  }

  /** a settled frame, for reduced motion and while paused */
  function still() {
    for (let i = 0; i < 220; i++) {
      simT += 33
      step(simT)
    }
    draw()
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    if (!running || !visible || document.hidden || !B) return
    if (now - last < 1000 / o.fps) return
    last = now
    simT += 33
    step(simT)
    draw()
  }

  function onMove(e: PointerEvent) {
    const r = canvas.getBoundingClientRect()
    pointer.x = e.clientX - r.left
    pointer.y = e.clientY - r.top
    if (pointer.x < -40 || pointer.y < -40 || pointer.x > W + 40 || pointer.y > H + 40) pointer.x = pointer.y = -1e4
  }
  const onLeave = () => (pointer.x = pointer.y = -1e4)

  const ro = new ResizeObserver(() => {
    resize()
    if (!running) still()
  })
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  const themeWatch = new MutationObserver(() => {
    readColors()
    if (!running) draw()
  })

  ;(async () => {
    try {
      await document.fonts.ready
    } catch {}
    if (destroyed) return
    readColors()
    resize()
    if (!running) still()
    raf = requestAnimationFrame(frame)
    ro.observe(canvas)
    io.observe(canvas)
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
  })()

  return {
    get running() {
      return running
    },
    setRunning(on: boolean) {
      running = on
    },
    setPlate(p: Plate) {
      o.plate = p
      if (!B) return
      B.fill(0)
      Hu.fill(0)
      Wt.fill(0)
      simT = 0
      setup()
      if (!running) still()
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      themeWatch.disconnect()
      removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }
}

export type Field = ReturnType<typeof createField>
