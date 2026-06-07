<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import '../../../styles/pokesprite-pokemon-gen8.css'

  let {
    pokemonName = 'pikachu',
    cols = 32,
    colorized = true,
    fontSize = 10,
    class: className = ''
  } = $props()

  let container: HTMLDivElement
  let artHtml = $state('')
  let ready = $state(false)

  const SPRITE_W = 68
  const SPRITE_H = 56
  const FONT_SIZE = fontSize
  const LINE_HEIGHT = Math.round(fontSize * 1.2)
  const FONT_FAMILY = '"Fira Code", monospace'
  const WEIGHTS = [300, 500, 700] as const
  const CHARSET = ' .·:;+*#%@&XWMB'

  type PaletteEntry = {
    char: string
    weight: number
    font: string
    width: number
    brightness: number
  }

  function getBackgroundPosition(name: string): { x: number; y: number } | null {
    const testEl = document.createElement('span')
    testEl.className = `pokesprite pokemon ${name}`
    testEl.style.position = 'absolute'
    testEl.style.visibility = 'hidden'
    document.body.appendChild(testEl)
    const style = getComputedStyle(testEl)
    const bgPos = style.backgroundPosition
    testEl.remove()
    if (!bgPos) return null
    const parts = bgPos.split(/\s+/)
    return {
      x: -parseFloat(parts[0] || '0'),
      y: -parseFloat(parts[1] || '0')
    }
  }

  function estimateBrightness(ch: string, font: string): number {
    const c = document.createElement('canvas')
    const sz = 20
    c.width = sz; c.height = sz
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.font = font
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, sz / 2)
    const data = ctx.getImageData(0, 0, sz, sz).data
    let sum = 0
    for (let i = 3; i < data.length; i += 4) sum += data[i]!
    return sum / (255 * sz * sz)
  }

  async function renderSpriteAsText() {
    if (!browser) return

    const pos = getBackgroundPosition(pokemonName)
    if (!pos) { artHtml = `<span style="opacity:0.5">Sprite not found</span>`; ready = true; return }

    const { prepareWithSegments } = await import('@chenglou/pretext')

    const palette: PaletteEntry[] = []
    for (const weight of WEIGHTS) {
      const font = `${weight} ${FONT_SIZE}px ${FONT_FAMILY}`
      for (const ch of CHARSET) {
        if (ch === ' ') continue
        const prepared = prepareWithSegments(ch, font)
        const width = prepared.widths.length > 0 ? prepared.widths[0]! : 0
        if (width <= 0) continue
        palette.push({
          char: ch, weight, font, width,
          brightness: estimateBrightness(ch, font)
        })
      }
    }
    const maxB = Math.max(...palette.map(e => e.brightness))
    if (maxB > 0) palette.forEach(e => { e.brightness /= maxB })
    palette.sort((a, b) => a.brightness - b.brightness)

    const img = new Image()
    img.crossOrigin = 'anonymous'

    const bgUrl = getComputedStyle(
      Object.assign(document.createElement('span'), {
        className: 'pokesprite pokemon ' + pokemonName,
        style: 'position:absolute;visibility:hidden'
      })
    ).backgroundImage

    const sheetEl = document.createElement('span')
    sheetEl.className = `pokesprite pokemon ${pokemonName}`
    sheetEl.style.position = 'absolute'
    sheetEl.style.visibility = 'hidden'
    document.body.appendChild(sheetEl)
    const sheetBg = getComputedStyle(sheetEl).backgroundImage
    sheetEl.remove()

    const urlMatch = sheetBg.match(/url\("?([^"]+)"?\)/)
    if (!urlMatch) { artHtml = `<span style="opacity:0.5">Sheet not found</span>`; ready = true; return }

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load spritesheet'))
      img.src = urlMatch[1]!
    })

    const offscreen = document.createElement('canvas')
    offscreen.width = SPRITE_W
    offscreen.height = SPRITE_H
    const ctx = offscreen.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(img, pos.x, pos.y, SPRITE_W, SPRITE_H, 0, 0, SPRITE_W, SPRITE_H)
    const pixels = ctx.getImageData(0, 0, SPRITE_W, SPRITE_H)

    const rows = Math.round(cols * (SPRITE_H / SPRITE_W) * 0.55)
    const cellW = SPRITE_W / cols
    const cellH = SPRITE_H / rows

    function findBestChar(brightness: number): PaletteEntry {
      let lo = 0, hi = palette.length - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (palette[mid]!.brightness < brightness) lo = mid + 1
        else hi = mid
      }
      let best = palette[lo]!, bestScore = Infinity
      const s = Math.max(0, lo - 8), e = Math.min(palette.length, lo + 8)
      for (let i = s; i < e; i++) {
        const score = Math.abs(palette[i]!.brightness - brightness)
        if (score < bestScore) { bestScore = score; best = palette[i]! }
      }
      return best
    }

    function esc(ch: string): string {
      if (ch === '<') return '&lt;'
      if (ch === '>') return '&gt;'
      if (ch === '&') return '&amp;'
      return ch
    }

    let html = ''
    for (let row = 0; row < rows; row++) {
      html += '<div class="art-row">'
      for (let col = 0; col < cols; col++) {
        const sx = Math.floor(col * cellW)
        const sy = Math.floor(row * cellH)
        const ex = Math.min(SPRITE_W, Math.ceil((col + 1) * cellW))
        const ey = Math.min(SPRITE_H, Math.ceil((row + 1) * cellH))
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0
        for (let y = sy; y < ey; y++) {
          for (let x = sx; x < ex; x++) {
            const idx = (y * SPRITE_W + x) * 4
            rSum += pixels.data[idx]!
            gSum += pixels.data[idx + 1]!
            bSum += pixels.data[idx + 2]!
            aSum += pixels.data[idx + 3]!
            count++
          }
        }
        const alpha = aSum / count / 255
        if (alpha < 0.1) {
          html += ' '
          continue
        }
        const r = Math.round(rSum / count)
        const g = Math.round(gSum / count)
        const bVal = Math.round(bSum / count)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * bVal) / 255 * alpha
        const match = findBestChar(brightness)
        const wCls = match.weight === 300 ? 'w3' : match.weight === 500 ? 'w5' : 'w7'

        if (colorized && alpha > 0.3) {
          html += `<span class="${wCls}" style="color:rgb(${r},${g},${bVal})">${esc(match.char)}</span>`
        } else {
          html += `<span class="${wCls}">${esc(match.char)}</span>`
        }
      }
      html += '</div>'
    }

    artHtml = html
    ready = true
  }

  onMount(() => {
    if (browser) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ready = true
        return
      }
      document.fonts.ready.then(() => renderSpriteAsText())
    }
  })
</script>

<div bind:this={container} class="sprite-ascii-wrap {className}" class:ready
  style="font-size:{FONT_SIZE}px; line-height:{LINE_HEIGHT}px;">
  {#if artHtml}
    {@html artHtml}
  {:else if !ready}
    <div class="ascii-loading">
      <span class="pokesprite pokemon {pokemonName}"></span>
    </div>
  {/if}
</div>

<style>
  .sprite-ascii-wrap {
    font-family: 'Fira Code', monospace;
    white-space: pre;
    letter-spacing: 0;
    user-select: none;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.6s ease-out;
  }

  .sprite-ascii-wrap.ready {
    opacity: 1;
  }

  .sprite-ascii-wrap :global(.w3) { font-weight: 300; }
  .sprite-ascii-wrap :global(.w5) { font-weight: 500; }
  .sprite-ascii-wrap :global(.w7) { font-weight: 700; }

  .sprite-ascii-wrap :global(.art-row) {
    display: block;
    line-height: inherit;
    height: 1lh;
  }

  .ascii-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80px;
  }
</style>
