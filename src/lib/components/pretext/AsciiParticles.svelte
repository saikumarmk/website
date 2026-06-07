<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import { isPageVisible } from '$lib/utils/motion'

  let {
    mouseX = 0,
    mouseY = 0
  } = $props()

  let container: HTMLDivElement
  let canvasEl: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D | null = null
  let mounted = false
  let animFrame = 0
  let reducedMotion = $state(false)
  let isVisible = true

  const CHAR_W = 7.8
  const LINE_HEIGHT = 16
  const FONT_SIZE = 13
  const FONT_FAMILY = '"Fira Code", monospace'
  const FIELD_OVERSAMPLE = 2
  const FIELD_DECAY = 0.72
  const RAMP = ' ·∙.:;-=+*%#@█'
  const HUE_PALETTE = [
    { h: 210, s: 80, l: 65 },
    { h: 270, s: 70, l: 60 },
    { h: 330, s: 65, l: 55 },
    { h: 180, s: 75, l: 50 },
    { h: 45,  s: 80, l: 60 },
  ]

  let isFirefox = false
  let PARTICLE_COUNT = 80
  let TARGET_FPS = 30

  let COLS = 80
  let ROWS = 50
  let CANVAS_W = 300
  let CANVAS_H = 300
  let FIELD_COLS = COLS * FIELD_OVERSAMPLE
  let FIELD_ROWS = ROWS * FIELD_OVERSAMPLE
  let FIELD_SCALE_X = FIELD_COLS / CANVAS_W
  let FIELD_SCALE_Y = FIELD_ROWS / CANVAS_H
  let FRAME_INTERVAL = 1000 / TARGET_FPS

  type Particle = { x: number; y: number; vx: number; vy: number; hueIdx: number; life: number }
  type FieldStamp = { radiusX: number; radiusY: number; sizeX: number; sizeY: number; values: Float32Array }

  let particles: Particle[] = []
  let brightnessField: Float32Array
  let hueField: Float32Array
  let particleStamp: FieldStamp
  let attractorStamp: FieldStamp
  let mouseStamp: FieldStamp
  let lastRenderTime = 0

  function spriteAlphaAt(d: number): number {
    if (d >= 1) return 0
    if (d <= 0.3) return 0.5 + (0.2 - 0.5) * (d / 0.3)
    return 0.2 * (1 - (d - 0.3) / 0.7)
  }

  function createFieldStamp(radius: number): FieldStamp {
    const rx = Math.ceil(radius * FIELD_SCALE_X)
    const ry = Math.ceil(radius * FIELD_SCALE_Y)
    const sx = rx * 2 + 1, sy = ry * 2 + 1
    const values = new Float32Array(sx * sy)
    const frx = radius * FIELD_SCALE_X, fry = radius * FIELD_SCALE_Y
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        values[(y + ry) * sx + x + rx] = spriteAlphaAt(Math.sqrt((x / frx) ** 2 + (y / fry) ** 2))
    return { radiusX: rx, radiusY: ry, sizeX: sx, sizeY: sy, values }
  }

  function splatStamp(cx: number, cy: number, stamp: FieldStamp, hueIdx: number) {
    const gcx = Math.round(cx * FIELD_SCALE_X), gcy = Math.round(cy * FIELD_SCALE_Y)
    for (let y = -stamp.radiusY; y <= stamp.radiusY; y++) {
      const gy = gcy + y
      if (gy < 0 || gy >= FIELD_ROWS) continue
      const fro = gy * FIELD_COLS, sro = (y + stamp.radiusY) * stamp.sizeX
      for (let x = -stamp.radiusX; x <= stamp.radiusX; x++) {
        const gx = gcx + x
        if (gx < 0 || gx >= FIELD_COLS) continue
        const sv = stamp.values[sro + x + stamp.radiusX]!
        if (sv === 0) continue
        const fi = fro + gx
        const oldB = brightnessField[fi]!
        const newB = Math.min(1, oldB + sv)
        brightnessField[fi] = newB
        if (sv > 0.05) {
          const blend = sv / (oldB + sv + 0.001)
          hueField[fi] = hueField[fi]! * (1 - blend) + hueIdx * blend
        }
      }
    }
  }

  function render(now: number) {
    if (!mounted || !ctx || !canvasEl) return
    animFrame = requestAnimationFrame(render)

    if (!isVisible || !isPageVisible()) return
    if (now - lastRenderTime < FRAME_INTERVAL) return
    lastRenderTime = now

    const containerRect = container.getBoundingClientRect()
    const normMx = (mouseX - containerRect.left) / (containerRect.width || 1)
    const normMy = (mouseY - containerRect.top) / (containerRect.height || 1)

    const a1x = Math.cos(now * 0.0005) * CANVAS_W * 0.3 + CANVAS_W / 2
    const a1y = Math.sin(now * 0.0008) * CANVAS_H * 0.3 + CANVAS_H / 2
    const a2x = Math.sin(now * 0.0003) * CANVAS_W * 0.35 + CANVAS_W / 2
    const a2y = Math.cos(now * 0.0006) * CANVAS_H * 0.35 + CANVAS_H / 2
    const a3x = Math.cos(now * 0.0009 + 2) * CANVAS_W * 0.2 + CANVAS_W / 2
    const a3y = Math.sin(now * 0.0004 + 2) * CANVAS_H * 0.25 + CANVAS_H / 2
    const mx = normMx * CANVAS_W
    const my = normMy * CANVAS_H

    const attractors = [
      { x: a1x, y: a1y, force: 0.18, hue: 0 },
      { x: a2x, y: a2y, force: 0.15, hue: 1 },
      { x: a3x, y: a3y, force: 0.12, hue: 2 },
      { x: mx, y: my, force: 0.08, hue: 3 },
    ]

    for (const p of particles) {
      let closestDist = Infinity, closestA = attractors[0]!
      for (const a of attractors) {
        const dx = a.x - p.x, dy = a.y - p.y
        const d = dx * dx + dy * dy
        if (d < closestDist) { closestDist = d; closestA = a }
      }
      const dx = closestA.x - p.x, dy = closestA.y - p.y
      const dist = Math.sqrt(closestDist) + 1
      p.vx += dx / dist * closestA.force + (Math.random() - 0.5) * 0.2
      p.vy += dy / dist * closestA.force + (Math.random() - 0.5) * 0.2

      const curl = Math.sin(now * 0.001 + p.x * 0.02) * 0.15
      p.vx += -dy / dist * curl
      p.vy += dx / dist * curl

      p.vx *= 0.965; p.vy *= 0.965
      p.x += p.vx; p.y += p.vy
      p.life = Math.min(1, p.life + 0.005)
      p.hueIdx = closestA.hue + (closestA.hue !== p.hueIdx ? 0.1 * (closestA.hue - p.hueIdx) : 0)

      if (p.x < -16) p.x += CANVAS_W + 32
      if (p.x > CANVAS_W + 16) p.x -= CANVAS_W + 32
      if (p.y < -16) p.y += CANVAS_H + 32
      if (p.y > CANVAS_H + 16) p.y -= CANVAS_H + 32
    }

    for (let i = 0; i < brightnessField.length; i++) {
      brightnessField[i]! *= FIELD_DECAY
    }

    for (const p of particles) splatStamp(p.x, p.y, particleStamp, p.hueIdx)
    for (const a of attractors) splatStamp(a.x, a.y, attractorStamp, a.hue)
    splatStamp(mx, my, mouseStamp, 4)

    const wavePhase = now * 0.002
    const dpr = window.devicePixelRatio || 1
    const w = canvasEl.width / dpr
    const h = canvasEl.height / dpr

    ctx.clearRect(0, 0, w, h)
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`
    ctx.textBaseline = 'top'

    for (let row = 0; row < ROWS; row++) {
      const fieldRowStart = row * FIELD_OVERSAMPLE * FIELD_COLS
      for (let col = 0; col < COLS; col++) {
        const fieldColStart = col * FIELD_OVERSAMPLE
        let brightness = 0
        let hueAcc = 0
        for (let sy = 0; sy < FIELD_OVERSAMPLE; sy++) {
          const offset = fieldRowStart + sy * FIELD_COLS + fieldColStart
          for (let sx = 0; sx < FIELD_OVERSAMPLE; sx++) {
            brightness += brightnessField[offset + sx]!
            hueAcc += hueField[offset + sx]!
          }
        }
        const samples = FIELD_OVERSAMPLE * FIELD_OVERSAMPLE
        brightness /= samples
        hueAcc /= samples

        const wave = Math.sin(wavePhase + col * 0.15 + row * 0.1) * 0.03
        brightness = Math.max(0, Math.min(1, brightness + wave))

        if (brightness < 0.02) continue

        const rampIdx = Math.min(RAMP.length - 1, (brightness * RAMP.length) | 0)
        const ch = RAMP[rampIdx]!

        const palIdx = Math.max(0, Math.min(HUE_PALETTE.length - 1, Math.round(hueAcc)))
        const pal = HUE_PALETTE[palIdx]!
        const hShift = Math.sin(now * 0.0003 + col * 0.08 + row * 0.06) * 20
        const hue = pal.h + hShift
        const lightness = pal.l + brightness * 20

        ctx.fillStyle = `hsl(${hue | 0},${pal.s}%,${lightness | 0}%)`
        ctx.fillText(ch, col * CHAR_W, row * LINE_HEIGHT)
      }
    }
  }

  function resizeCanvas() {
    if (!canvasEl || !container) return
    const rect = container.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, isFirefox ? 1.5 : 2)

    COLS = Math.max(20, Math.floor(rect.width / CHAR_W))
    ROWS = Math.max(10, Math.floor(rect.height / LINE_HEIGHT))

    if (isFirefox) {
      COLS = Math.min(COLS, 52)
      ROWS = Math.min(ROWS, 34)
    }

    CANVAS_W = Math.round(COLS * CHAR_W)
    CANVAS_H = Math.round(ROWS * LINE_HEIGHT)
    FIELD_COLS = COLS * FIELD_OVERSAMPLE
    FIELD_ROWS = ROWS * FIELD_OVERSAMPLE
    FIELD_SCALE_X = FIELD_COLS / CANVAS_W
    FIELD_SCALE_Y = FIELD_ROWS / CANVAS_H

    canvasEl.width = Math.round(rect.width * dpr)
    canvasEl.height = Math.round(rect.height * dpr)
    canvasEl.style.width = `${rect.width}px`
    canvasEl.style.height = `${rect.height}px`

    ctx = canvasEl.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`
      ctx.textBaseline = 'top'
    }

    brightnessField = new Float32Array(FIELD_COLS * FIELD_ROWS)
    hueField = new Float32Array(FIELD_COLS * FIELD_ROWS)
    particleStamp = createFieldStamp(16)
    attractorStamp = createFieldStamp(35)
    mouseStamp = createFieldStamp(20)
  }

  onMount(async () => {
    if (!browser) return
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    isFirefox = /firefox/i.test(navigator.userAgent)
    if (isFirefox) {
      PARTICLE_COUNT = 40
      TARGET_FPS = 18
      FRAME_INTERVAL = 1000 / TARGET_FPS
    }

    await document.fonts.ready
    resizeCanvas()

    particles = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 60 + 15
      particles.push({
        x: CANVAS_W / 2 + Math.cos(angle) * r,
        y: CANVAS_H / 2 + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        hueIdx: Math.random() * HUE_PALETTE.length,
        life: 0
      })
    }

    const visObs = new IntersectionObserver(([entry]) => {
      isVisible = entry?.isIntersecting ?? false
    }, { threshold: 0 })
    visObs.observe(container)

    const resizeObs = new ResizeObserver(() => resizeCanvas())
    resizeObs.observe(container)

    mounted = true
    animFrame = requestAnimationFrame(render)

    return () => {
      visObs.disconnect()
      resizeObs.disconnect()
    }
  })

  onDestroy(() => {
    mounted = false
    if (animFrame) cancelAnimationFrame(animFrame)
  })
</script>

<div bind:this={container} class="ascii-particles-wrap">
  <canvas bind:this={canvasEl} class="ascii-canvas" aria-hidden="true"></canvas>
  {#if reducedMotion}
    <div class="ascii-fallback">
      <span class="text-4xl font-bold text-primary/60">Sai Kumar</span>
      <span class="text-lg text-secondary/60">ML Engineer & Builder</span>
    </div>
  {/if}
</div>

<style>
  .ascii-particles-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ascii-canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  .ascii-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
</style>
