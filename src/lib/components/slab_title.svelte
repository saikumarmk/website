<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  let { title, slug = '', config = '', href = '', center = true, canvas: useCanvas = false } = $props()

  const accentColors = [
    'text-primary',
    'text-secondary',
    'text-accent',
    'text-info',
    'text-success',
    'text-warning',
    'text-error'
  ]

  const canvasAccentColors = [
    'hsl(var(--p))',
    'hsl(var(--s))',
    'hsl(var(--a))',
    'hsl(var(--in))',
    'hsl(var(--su))',
    'hsl(var(--wa))',
    'hsl(var(--er))'
  ]

  const grayscaleColors = ['text-base-content', 'text-base-content/80', 'text-base-content/60']

  interface WordConfig {
    size: number
    colored: boolean
    italic: boolean
  }

  function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  let words = $derived(title.split(' '))
  let safePath = $derived(slug.split('/').pop() || slug || 'title')

  function autoGenerateConfig(w: string[], path: string): WordConfig[] {
    return w.map((word, i) => {
      const wordHash = hashCode(word + i + path)
      const baseSize = 2.2 + (word.length > 6 ? 0.3 : word.length > 3 ? 0.6 : 0.8)
      const sizeVariation = ((wordHash % 5) - 2) * 0.15
      const size = Math.max(1.8, Math.min(3.5, baseSize + sizeVariation))
      const colored = (wordHash % 10) < (word.length < 5 ? 5 : 3)
      const italic = (wordHash % 10) > 7
      return { size, colored, italic }
    })
  }

  let wordConfigs = $derived(
    config
      ? config.split(/\s+/).filter(Boolean).map(cfg => {
          const sizeMatch = cfg.match(/^([\d.]+)/)
          const size = sizeMatch ? parseFloat(sizeMatch[1]) : 2.5
          return { size, colored: cfg.includes('c'), italic: cfg.includes('i') }
        })
      : autoGenerateConfig(words, safePath)
  )

  function getColorClass(index: number, colored: boolean): string {
    const h = hashCode(safePath + index)
    return colored ? accentColors[h % accentColors.length] : grayscaleColors[h % grayscaleColors.length]
  }

  function getWeight(index: number, italic: boolean): number {
    const h = hashCode(safePath + index)
    return italic ? [300, 400, 500][h % 3] : 900
  }

  let styledWords = $derived(
    words.map((word: string, i: number) => {
      const wordConfig = wordConfigs[i] ?? { size: 2.5, colored: false, italic: false }
      return {
        word,
        colorClass: getColorClass(i, wordConfig.colored),
        fontWeight: getWeight(i, wordConfig.italic),
        size: wordConfig.size,
        italic: wordConfig.italic,
        colored: wordConfig.colored
      }
    })
  )

  // Canvas rendering
  let canvasEl: HTMLCanvasElement
  let canvasCtx: CanvasRenderingContext2D | null = null
  let resizeObserver: ResizeObserver | null = null
  let mounted = false

  function drawCanvas() {
    if (!canvasEl || !canvasCtx || !browser) return
    const dpr = window.devicePixelRatio || 1
    const w = parseFloat(canvasEl.style.width || '0')
    const h = parseFloat(canvasEl.style.height || '0')
    canvasCtx.clearRect(0, 0, w, h)

    let x = center ? 0 : 0
    let y = 0
    const gap = 12
    const lineHeight = 1.1

    // Measure all words first to determine layout
    type WordMeasure = { word: string; width: number; size: number; fontStr: string; colorIdx: number; colored: boolean }
    const measures: WordMeasure[] = styledWords.map((sw, i) => {
      const fontStr = `${sw.fontWeight} ${sw.size}rem sans-serif`
      canvasCtx!.font = fontStr
      const m = canvasCtx!.measureText(sw.word.toUpperCase())
      return {
        word: sw.word.toUpperCase(),
        width: m.width,
        size: sw.size,
        fontStr,
        colorIdx: i,
        colored: sw.colored
      }
    })

    // Simple word-wrap layout
    const lines: WordMeasure[][] = [[]]
    let lineWidth = 0
    for (const m of measures) {
      if (lineWidth > 0 && lineWidth + gap + m.width > w) {
        lines.push([])
        lineWidth = 0
      }
      lines[lines.length - 1].push(m)
      lineWidth += (lineWidth > 0 ? gap : 0) + m.width
    }

    // Draw
    let drawY = 0
    for (const line of lines) {
      const lw = line.reduce((s, m, i) => s + m.width + (i > 0 ? gap : 0), 0)
      let drawX = center ? (w - lw) / 2 : 0
      let maxSize = 0
      for (const m of line) {
        if (m.size > maxSize) maxSize = m.size
      }
      drawY += maxSize * 16 * lineHeight

      for (const m of line) {
        canvasCtx!.font = m.fontStr
        const h2 = hashCode(safePath + m.colorIdx)
        canvasCtx!.fillStyle = m.colored
          ? canvasAccentColors[h2 % canvasAccentColors.length]
          : 'hsl(var(--bc))'
        canvasCtx!.fillText(m.word, drawX, drawY)
        drawX += m.width + gap
      }
    }

    // Resize canvas height to fit content
    const neededH = drawY + 20
    if (Math.abs(neededH - h) > 5) {
      canvasEl.height = neededH * dpr
      canvasEl.style.height = `${neededH}px`
      canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawCanvas()
    }
  }

  function initCanvas() {
    if (!canvasEl || !browser) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvasEl.parentElement?.getBoundingClientRect()
    const w = rect?.width || 600
    canvasEl.width = w * dpr
    canvasEl.height = 200 * dpr
    canvasEl.style.width = `${w}px`
    canvasEl.style.height = `200px`
    canvasCtx = canvasEl.getContext('2d')
    if (canvasCtx) {
      canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawCanvas()
    }
  }

  onMount(() => {
    if (!useCanvas || !browser) return
    mounted = true
    initCanvas()
    resizeObserver = new ResizeObserver(() => {
      if (!canvasEl) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvasEl.parentElement?.getBoundingClientRect()
      const w = rect?.width || 600
      canvasEl.width = w * dpr
      canvasEl.style.width = `${w}px`
      if (canvasCtx) {
        canvasCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
        drawCanvas()
      }
    })
    if (canvasEl?.parentElement) resizeObserver.observe(canvasEl.parentElement)
  })

  onDestroy(() => {
    resizeObserver?.disconnect()
  })
</script>

{#if useCanvas && browser}
  <div class="slab-canvas-wrap">
    <canvas bind:this={canvasEl} class="slab-canvas"></canvas>
    <span class="sr-only">{title}</span>
  </div>
{:else if href}
  <a {href} class="block outline-none">
    <h2 class="flex flex-wrap items-baseline gap-x-3 gap-y-1 {center ? 'justify-center' : 'justify-start'}">
      {#each styledWords as { word, colorClass, fontWeight, size, italic }}
        <span
          class="leading-none uppercase {colorClass}"
          class:italic
          class:font-mono={!italic}
          style="font-size: {size}rem; font-weight: {fontWeight};">{word}</span>
      {/each}
    </h2>
  </a>
{:else}
  <h1 class="flex flex-wrap items-baseline gap-x-3 gap-y-1 {center ? 'justify-center' : 'justify-start'}">
    {#each styledWords as { word, colorClass, fontWeight, size, italic }}
      <span
        class="leading-none uppercase {colorClass}"
        class:italic
        class:font-mono={!italic}
        style="font-size: {size}rem; font-weight: {fontWeight};">{word}</span>
    {/each}
  </h1>
{/if}

<style>
  .slab-canvas-wrap {
    position: relative;
    width: 100%;
  }
  .slab-canvas {
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
