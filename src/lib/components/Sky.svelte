<!--
  Ink only: gold knots as stars outside the text column (and the vine rail on posts).
  Near the pointer they join into constellations. About 20 fps with a little parallax;
  reduced motion draws a still sky, and nothing runs while the tab is hidden.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'
  import { rng } from '$lib/thread'

  let ink = $state(false)
  let remeasure: (() => void) | undefined

  onMount(() => {
    const html = document.documentElement
    const sync = () => (ink = html.dataset.theme === 'ink')
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
  })

  afterNavigate(() => {
    requestAnimationFrame(() => remeasure?.())
    // page transitions move the column after the first frame
    setTimeout(() => remeasure?.(), 350)
  })

  type Tone = 'g1' | 'c1' | 'c2'
  interface Star {
    x: number
    y: number
    z: number
    tone: Tone
    ph: number
    sp: number
    r: number
  }

  function stars(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let list: Star[] = []
    let cols: Record<Tone, string> = { g1: '#d6b25c', c1: '', c2: '' }
    let ptr = { x: -1e4, y: -1e4 }
    let timer: ReturnType<typeof setTimeout> | undefined
    let raf = 0

    function measure() {
      const dpr = Math.min(2, devicePixelRatio || 1), w = innerWidth, h = innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const cs = getComputedStyle(document.documentElement)
      cols = { g1: cs.getPropertyValue('--g1').trim() || '#d6b25c', c2: cs.getPropertyValue('--c2').trim(), c1: cs.getPropertyValue('--c1').trim() }
      const col = document.querySelector('#main .col')
      const page = document.querySelector<HTMLElement>('.page')
      let band: [number, number]
      if (col) {
        const r = col.getBoundingClientRect()
        band = [r.left - 28, r.right + 28]
      } else {
        const r = page?.getBoundingClientRect() ?? { left: 0 }
        const padl = page ? parseFloat(getComputedStyle(page).paddingLeft) : 0
        band = [r.left + padl - 28, r.left + padl + Math.max(320, Math.min(w * 0.52, 704)) + 28]
      }
      const vine = document.querySelector('.vine')
      const railR = vine && getComputedStyle(vine).display !== 'none' ? vine.getBoundingClientRect().right : 0
      const rn = rng(0x5eed5a1), n = Math.round((w * h) / 7000)
      list = []
      for (let i = 0; i < n * 3 && list.length < n; i++) {
        const x = rn() * w, y = rn() * h * 1.5, z = 0.3 + rn() * 0.7, t = rn()
        if ((x > band[0] && x < band[1]) || x < railR) continue
        list.push({ x, y, z, tone: t < 0.82 ? 'g1' : t < 0.92 ? 'c2' : 'c1', ph: rn() * 6.28, sp: 0.6 + rn() * 1.2, r: 0.6 + z * 1.1 })
      }
    }

    function draw(now = 0) {
      const w = innerWidth, h = innerHeight, span = h * 1.5
      ctx.clearRect(0, 0, w, h)
      const near: { x: number; y: number; d: number }[] = []
      for (const s of list) {
        const y = still ? s.y : (((s.y - scrollY * 0.06 * s.z) % span) + span) % span
        if (y > h + 4) continue
        const d = Math.hypot(s.x - ptr.x, y - ptr.y), lift = d < 150 ? 1 - d / 150 : 0
        const a = (0.18 + 0.4 * s.z) * (still ? 1 : 0.65 + 0.35 * Math.sin(now * 0.0011 * s.sp + s.ph)) + lift * 0.5
        ctx.globalAlpha = Math.min(1, a)
        ctx.fillStyle = cols[s.tone]
        ctx.beginPath()
        ctx.arc(s.x, y, s.r + lift * 1.2, 0, 6.2832)
        ctx.fill()
        if (s.z > 0.93) {
          ctx.strokeStyle = cols[s.tone]
          ctx.lineWidth = 0.6
          ctx.globalAlpha = a * 0.6
          ctx.beginPath()
          ctx.moveTo(s.x - 4, y)
          ctx.lineTo(s.x + 4, y)
          ctx.moveTo(s.x, y - 4)
          ctx.lineTo(s.x, y + 4)
          ctx.stroke()
        }
        if (lift > 0) near.push({ x: s.x, y, d })
      }
      const pts = near.sort((a, b) => a.d - b.d).slice(0, 7)
      ctx.setLineDash([3, 3])
      ctx.lineWidth = 0.8
      ctx.strokeStyle = cols.g1
      for (let i = 1; i < pts.length; i++) {
        let best = pts[0], bd = 1e9
        for (let j = 0; j < i; j++) {
          const dd = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)
          if (dd < bd) {
            bd = dd
            best = pts[j]
          }
        }
        ctx.globalAlpha = 0.45 * (1 - pts[i].d / 150)
        ctx.beginPath()
        ctx.moveTo(best.x, best.y)
        ctx.lineTo(pts[i].x, pts[i].y)
        ctx.stroke()
      }
      ctx.setLineDash([])
      ctx.globalAlpha = 1
    }

    function loop() {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
      if (document.hidden) return
      draw(performance.now())
      if (!still) timer = setTimeout(() => (raf = requestAnimationFrame(loop)), 50)
    }
    const reset = () => {
      measure()
      loop()
    }
    const onMove = (e: PointerEvent) => {
      ptr = { x: e.clientX, y: e.clientY }
      if (still) draw()
    }
    const onLeave = () => {
      ptr = { x: -1e4, y: -1e4 }
      if (still) draw()
    }

    remeasure = reset
    addEventListener('resize', reset)
    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', loop)
    reset()

    return {
      destroy() {
        clearTimeout(timer)
        cancelAnimationFrame(raf)
        remeasure = undefined
        removeEventListener('resize', reset)
        removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('pointerleave', onLeave)
        document.removeEventListener('visibilitychange', loop)
      }
    }
  }
</script>

{#if ink}<canvas class="sky" aria-hidden="true" use:stars></canvas>{/if}

<style>
  .sky {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }
  /* the body's own background would paint over a negative z-index canvas; html carries the same colour */
  :global(html[data-theme='ink'] body) {
    background: transparent;
  }
  @media print {
    .sky {
      display: none;
    }
  }
</style>
