/** The trainer-card flower from design-prototypes/stitch.js, drawn as directional glyphs. */
export function createAsciiFlower(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { destroy() {} }
  type Tone = 'ink' | 'deep' | 'light'
  type Stitch = { i: number; ch: string; tone: Tone }
  const golden = Math.PI * (3 - Math.sqrt(5))
  const glyphs = ['-', '\\', '|', '/']
  const fontSize = 9
  const lineH = 10
  const duration = 1600
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0,
    height = 0,
    cw = 6.6,
    cols = 0,
    rows = 0
  let stitches: Stitch[] = []
  let colors: Record<Tone, string>
  let shown = 0,
    frame = 0,
    start = 0
  let started = false,
    destroyed = false

  function glyphFor(dx: number, dy: number) {
    let angle = Math.atan2(dy, dx)
    if (angle < 0) angle += Math.PI
    return glyphs[Math.round(angle / (Math.PI / 4)) % 4]
  }
  function put(x: number, y: number, ch: string, tone: Tone = 'ink') {
    const c = Math.floor(x / cw),
      r = Math.floor(y / lineH)
    if (c < 0 || r < 0 || c >= cols || r >= rows) return
    stitches.push({ i: r * cols + c, ch, tone })
  }
  function stroke(x: number, y: number, dx: number, dy: number, length: number, tone: Tone) {
    const d = Math.hypot(dx, dy) || 1,
      ux = dx / d,
      uy = dy / d
    const step = Math.min(cw, lineH) * 0.9,
      glyph = glyphFor(ux, uy)
    for (let s = 0; s <= length; s += step) put(x + ux * s, y + uy * s, glyph, tone)
  }
  function petal(
    cx: number,
    cy: number,
    angle: number,
    r0: number,
    length: number,
    breadth: number,
    tone: Tone,
    vein: Tone | null
  ) {
    const ux = Math.cos(angle),
      uy = Math.sin(angle),
      vx = -uy,
      vy = ux
    const half = (t: number) => breadth * Math.pow(Math.sin(Math.PI * t), 0.75) * (1 - 0.35 * t)
    const at = (t: number, s: number) => [cx + ux * (r0 + length * t) + vx * s, cy + uy * (r0 + length * t) + vy * s]
    const step = (Math.min(cw, lineH) * 0.45) / length
    for (let t = 0; t <= 1; t += step)
      for (let s = -half(t); s <= half(t); s += cw * 0.45) {
        const [x, y] = at(t, s)
        put(x, y, ' ')
      }
    for (const side of [-1, 1]) {
      let [px, py] = at(0, 0)
      for (let t = step; t <= 1 + 1e-9; t += step) {
        const [x, y] = at(t, side * half(t))
        put(x, y, glyphFor(x - px, y - py), tone)
        px = x
        py = y
      }
    }
    if (vein)
      for (let t = 0.25; t <= 0.7; t += step * 1.5) {
        const [x, y] = at(t, 0)
        put(x, y, glyphFor(ux, uy), vein)
      }
  }
  function bloom(cx: number, cy: number, radius: number) {
    const layers = [8, 5],
      core = 0.2
    layers.forEach((count, layer) => {
      const reach = radius * (1 - (layer / (layers.length - 1)) * 0.42)
      const breadth = (Math.PI * reach * 0.62) / count
      for (let p = 0; p < count; p++) {
        const angle = layer * golden + (p * 2 * Math.PI) / count
        petal(
          cx,
          cy,
          angle,
          radius * core * 0.6,
          reach - radius * core * 0.6,
          breadth,
          layer === 0 ? 'deep' : 'ink',
          layer === layers.length - 1 ? null : 'light'
        )
      }
    })
    const kr = radius * core,
      n = Math.max(6, Math.round(((kr * kr) / (cw * lineH)) * 1.6))
    for (let i = 0; i < n * 2; i++) {
      const angle = i * golden,
        r = kr * Math.sqrt(i / (n * 2))
      put(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, ' ')
    }
    for (let i = 1; i <= n; i++) {
      const angle = i * golden,
        r = kr * Math.sqrt(i / n)
      put(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, i % 3 ? 'o' : '·', 'ink')
    }
  }
  function leaf(x0: number, y0: number, x1: number, y1: number, breadth: number, bend: number) {
    const length = Math.hypot(x1 - x0, y1 - y0)
    const qx = (x0 + x1) / 2 - (y1 - y0) * bend,
      qy = (y0 + y1) / 2 + (x1 - x0) * bend
    const steps = Math.ceil(length / (lineH * 0.6))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps,
        u = 1 - t
      const px = u * u * x0 + 2 * u * t * qx + t * t * x1,
        py = u * u * y0 + 2 * u * t * qy + t * t * y1
      let tx = 2 * u * (qx - x0) + 2 * t * (x1 - qx),
        ty = 2 * u * (qy - y0) + 2 * t * (y1 - qy)
      const tl = Math.hypot(tx, ty) || 1
      tx /= tl
      ty /= tl
      const w = breadth * Math.pow(Math.sin(Math.PI * t), 0.8)
      for (const side of [-1, 1]) stroke(px, py, -ty * side + tx * 0.55, tx * side + ty * 0.55, w, 'ink')
      put(px, py, glyphFor(tx, ty), 'deep')
    }
  }
  function readColors() {
    const css = getComputedStyle(canvas)
    const value = (name: string) => css.getPropertyValue(name).trim()
    colors = { ink: value('--r3'), deep: value('--r4'), light: value('--r3') }
  }
  function resize() {
    const box = canvas.getBoundingClientRect()
    if (box.width < 2 || box.height < 2) return false
    const dpr = Math.min(devicePixelRatio || 1, 2)
    ctx!.font = `500 ${fontSize}px "IBM Plex Mono", monospace`
    const measured = ctx!.measureText('M').width || 6.6
    if (width === box.width && height === box.height && cw === measured && canvas.width === Math.round(width * dpr))
      return false
    width = box.width
    height = box.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.font = `500 ${fontSize}px "IBM Plex Mono", monospace`
    cw = measured
    cols = Math.ceil(width / cw)
    rows = Math.ceil(height / lineH)
    stitches = []
    leaf(width * 0.1, height * 0.95, width * 0.45, height * 0.5, 16, 0.2)
    bloom(width * 0.62, height * 0.62, Math.min(width, height) * 0.42)
    return true
  }
  function draw(n: number) {
    const grid: Array<Stitch | undefined> = new Array(cols * rows)
    for (let k = 0; k < n; k++) grid[stitches[k].i] = stitches[k]
    ctx!.clearRect(0, 0, width, height)
    ctx!.font = `500 ${fontSize}px "IBM Plex Mono", monospace`
    ctx!.textBaseline = 'top'
    grid.forEach((stitch, i) => {
      if (!stitch || stitch.ch === ' ') return
      ctx!.fillStyle = colors[stitch.tone]
      ctx!.fillText(stitch.ch, (i % cols) * cw, Math.floor(i / cols) * lineH)
    })
  }
  function finish() {
    cancelAnimationFrame(frame)
    shown = stitches.length
    draw(shown)
  }
  function tick(now: number) {
    if (!start) start = now
    const p = Math.min(1, (now - start) / duration)
    shown = Math.floor(stitches.length * (1 - Math.pow(1 - p, 2)))
    draw(shown)
    if (p < 1) frame = requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return
    started = true
    io.disconnect()
    readColors()
    if (!resize()) return
    if (motion.matches) finish()
    else frame = requestAnimationFrame(tick)
  })
  const ro = new ResizeObserver(() => {
    if (!started) return
    readColors()
    if (resize()) finish()
  })
  const theme = new MutationObserver(() => {
    readColors()
    if (started) draw(shown)
  })
  const onMotion = () => {
    if (motion.matches && started) finish()
  }
  io.observe(canvas)
  ro.observe(canvas)
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  motion.addEventListener('change', onMotion)
  void document.fonts.ready.then(() => {
    if (!destroyed && started && resize()) finish()
  })
  return {
    destroy() {
      destroyed = true
      cancelAnimationFrame(frame)
      io.disconnect()
      ro.disconnect()
      theme.disconnect()
      motion.removeEventListener('change', onMotion)
    }
  }
}
