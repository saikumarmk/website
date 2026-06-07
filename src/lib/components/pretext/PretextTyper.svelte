<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  let {
    text = '',
    font = '24px pokemondppt, monospace',
    color = '#333',
    speed = 30,
    maxWidth = 500,
    lineHeight = 48,
    onComplete = () => {}
  } = $props()

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D | null = null
  let charIndex = $state(0)
  let typing = $state(false)
  let lines: any[] = []
  let prepared: any = null
  let animFrame = 0
  let lastTick = 0
  let mounted = false

  async function startTyping() {
    if (!browser || !canvas) return
    const { prepareWithSegments, layoutWithLines } = await import('@chenglou/pretext')
    ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.parentElement?.getBoundingClientRect()
    const w = rect?.width || maxWidth
    canvas.width = w * dpr
    ctx.scale(dpr, dpr)

    prepared = prepareWithSegments(text, font)
    const result = layoutWithLines(prepared, w, lineHeight)
    lines = result.lines

    const totalH = Math.max(lineHeight * 2, result.height + lineHeight)
    canvas.height = totalH * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${totalH}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    charIndex = 0
    typing = true
    lastTick = performance.now()
    mounted = true
    tick()
  }

  function tick() {
    if (!mounted || !typing) return
    const now = performance.now()
    if (now - lastTick >= speed) {
      charIndex++
      lastTick = now
      if (charIndex >= text.length) {
        typing = false
        onComplete()
      }
    }
    draw()
    animFrame = requestAnimationFrame(tick)
  }

  function draw() {
    if (!ctx || !canvas) return
    const w = parseFloat(canvas.style.width)
    const h = parseFloat(canvas.style.height)
    ctx.clearRect(0, 0, w, h)
    ctx.font = font
    ctx.fillStyle = color

    let charsSoFar = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineText = line.text
      const y = i * lineHeight + lineHeight * 0.8

      if (charsSoFar + lineText.length <= charIndex) {
        ctx.fillText(lineText, 0, y)
        charsSoFar += lineText.length
      } else {
        const remaining = charIndex - charsSoFar
        if (remaining > 0) {
          ctx.fillText(lineText.slice(0, remaining), 0, y)
        }
        break
      }
    }
  }

  $effect(() => {
    if (text && browser && canvas) {
      charIndex = 0
      typing = false
      if (animFrame) cancelAnimationFrame(animFrame)
      startTyping()
    }
  })

  onMount(() => {
    mounted = true
  })

  onDestroy(() => {
    mounted = false
    typing = false
    if (animFrame) cancelAnimationFrame(animFrame)
  })
</script>

<div class="pretext-typer-wrap">
  <canvas bind:this={canvas} class="pretext-typer-canvas"></canvas>
  <span class="sr-only">{text}</span>
</div>

<style>
  .pretext-typer-wrap {
    position: relative;
    width: 100%;
  }
  .pretext-typer-canvas {
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
