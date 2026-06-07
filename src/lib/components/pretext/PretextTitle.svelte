<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  let {
    text = '',
    font = '700 64px Inter, system-ui, sans-serif',
    maxWidth = 600,
    lineHeight = 72,
    mouseX = 0,
    mouseY = 0,
    breathe = true
  } = $props()

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D | null = null
  let lines: any[] = []
  let observer: ResizeObserver | null = null
  let animFrame = 0
  let mounted = false
  let reducedMotion = false
  let pretextMod: any = null

  const palette = [
    'hsl(var(--p))',
    'hsl(var(--s))',
    'hsl(var(--a))',
    'hsl(var(--in))',
    'hsl(var(--su))'
  ]

  function layoutAndSize(w: number) {
    if (!pretextMod || !ctx || !canvas) return
    const prepared = pretextMod.prepareWithSegments(text, font)
    const result = pretextMod.layoutWithLines(prepared, w, lineHeight)
    lines = result.lines

    const dpr = window.devicePixelRatio || 1
    const totalH = Math.max(lineHeight * 2, result.height + lineHeight)
    canvas.width = w * dpr
    canvas.height = totalH * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${totalH}px`
    ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function draw() {
    if (!ctx || !canvas || !mounted) return
    const w = parseFloat(canvas.style.width || '0')
    const h = parseFloat(canvas.style.height || '0')
    ctx.clearRect(0, 0, w, h)

    const time = performance.now() / 1000
    const normMx = mouseX / (window.innerWidth || 1)
    const normMy = mouseY / (window.innerHeight || 1)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const y = i * lineHeight + lineHeight * 0.8
      const parallaxX = reducedMotion ? 0 : (normMx - 0.5) * 12 * (i % 2 === 0 ? 1 : -1)
      const parallaxY = reducedMotion ? 0 : (normMy - 0.5) * 6
      const breatheOff = breathe && !reducedMotion ? Math.sin(time * 0.6 + i * 0.7) * 3 : 0

      ctx.save()
      ctx.font = font
      ctx.fillStyle = palette[i % palette.length]
      ctx.globalAlpha = reducedMotion ? 1 : 0.8 + Math.sin(time * 0.4 + i * 1.2) * 0.2
      ctx.fillText(line.text, parallaxX, y + parallaxY + breatheOff)
      ctx.restore()
    }

    animFrame = requestAnimationFrame(draw)
  }

  onMount(async () => {
    if (!browser) return
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pretextMod = await import('@chenglou/pretext')
    ctx = canvas.getContext('2d')
    if (!ctx) return
    mounted = true

    const rect = canvas.parentElement?.getBoundingClientRect()
    const w = rect?.width || maxWidth
    layoutAndSize(w)
    animFrame = requestAnimationFrame(draw)

    observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) layoutAndSize(entry.contentRect.width)
      }
    })
    if (canvas.parentElement) observer.observe(canvas.parentElement)
  })

  onDestroy(() => {
    mounted = false
    if (animFrame) cancelAnimationFrame(animFrame)
    observer?.disconnect()
  })
</script>

<div class="pretext-title-wrap">
  <canvas bind:this={canvas} class="pretext-canvas"></canvas>
  <span class="sr-only">{text}</span>
</div>

<style>
  .pretext-title-wrap {
    position: relative;
    width: 100%;
  }
  .pretext-canvas {
    display: block;
    width: 100%;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
