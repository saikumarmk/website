<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { prepareWithSegments, layoutNextLine, type PreparedTextWithSegments, type LayoutCursor, type LayoutLine } from '@chenglou/pretext'
  import '../../../styles/pokesprite-pokemon-gen8.css'

  type SpriteInput = {
    pokemonName: string
    xPercent: number
    yLine: number
    width?: number
    height?: number
    padding?: number
  }

  type ResolvedSprite = {
    pokemonName: string
    x: number
    y: number
    width: number
    height: number
    padding: number
  }

  let {
    text = '',
    font = '16px "Fira Code", monospace',
    lineHeight = 26,
    sprites = [] as SpriteInput[],
    class: className = ''
  } = $props()

  let container: HTMLDivElement

  type Interval = { left: number; right: number }

  function resolveSprites(inputs: SpriteInput[], areaWidth: number): ResolvedSprite[] {
    return inputs.map(sp => ({
      pokemonName: sp.pokemonName,
      x: Math.round(sp.xPercent * areaWidth),
      y: sp.yLine * lineHeight,
      width: sp.width ?? 40,
      height: sp.height ?? 40,
      padding: sp.padding ?? 4
    }))
  }

  function carveSlots(base: Interval, blocked: Interval[]): Interval[] {
    let slots: Interval[] = [base]
    for (const block of blocked) {
      const next: Interval[] = []
      for (const slot of slots) {
        if (block.right <= slot.left || block.left >= slot.right) {
          next.push(slot)
          continue
        }
        if (block.left > slot.left) next.push({ left: slot.left, right: block.left })
        if (block.right < slot.right) next.push({ left: block.right, right: slot.right })
      }
      slots = next
    }
    return slots.filter(s => s.right - s.left >= 30)
  }

  function getBlockedIntervals(obstacles: ResolvedSprite[], lineTop: number, lineBottom: number): Interval[] {
    const intervals: Interval[] = []
    for (const sp of obstacles) {
      const spTop = sp.y - sp.padding
      const spBottom = sp.y + sp.height + sp.padding
      if (lineBottom > spTop && lineTop < spBottom) {
        intervals.push({
          left: sp.x - sp.padding,
          right: sp.x + sp.width + sp.padding
        })
      }
    }
    return intervals
  }

  function layoutText(prepared: PreparedTextWithSegments, areaWidth: number, obstacles: ResolvedSprite[]) {
    const lines: { text: string; x: number; y: number; width: number }[] = []
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let lineTop = 0

    for (let i = 0; i < 500; i++) {
      const lineBottom = lineTop + lineHeight
      const blocked = getBlockedIntervals(obstacles, lineTop, lineBottom)
      const slots = carveSlots({ left: 0, right: areaWidth }, blocked)

      if (slots.length === 0) {
        lineTop += lineHeight
        continue
      }

      const bestSlot = slots.reduce((a, b) => (b.right - b.left > a.right - a.left ? b : a))
      const slotWidth = bestSlot.right - bestSlot.left

      const line: LayoutLine | null = layoutNextLine(prepared, cursor, slotWidth)
      if (!line) break

      lines.push({
        text: line.text,
        x: bestSlot.left,
        y: lineTop,
        width: line.width
      })

      cursor = line.end
      lineTop += lineHeight
    }

    return lines
  }

  function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  onMount(async () => {
    if (!browser) return
    try {
      await document.fonts.ready

      const rect = container.getBoundingClientRect()
      const containerWidth = rect.width
      if (containerWidth < 500) return

      const resolved = resolveSprites(sprites, containerWidth)
      const prepared = prepareWithSegments(text, font)
      const lines = layoutText(prepared, containerWidth, resolved)

      const lastLine = lines[lines.length - 1]
      const textBottom = lastLine ? lastLine.y + lineHeight : 0
      const spriteBottom = resolved.reduce((max, sp) => Math.max(max, sp.y + sp.height), 0)
      const totalHeight = Math.max(textBottom, spriteBottom) + lineHeight

      const inner = container.querySelector('.pretext-bio-inner') as HTMLDivElement
      if (!inner) return

      inner.classList.remove('hidden')
      inner.style.display = 'block'
      inner.style.minHeight = `${totalHeight}px`

      for (const line of lines) {
        const span = document.createElement('span')
        span.className = 'pretext-line'
        span.style.cssText = `position:absolute;left:${line.x}px;top:${line.y}px;white-space:pre;opacity:0.8;`
        span.textContent = line.text
        inner.appendChild(span)
      }

      for (const sp of resolved) {
        const div = document.createElement('div')
        div.className = 'pretext-sprite'
        div.style.cssText = `position:absolute;left:${sp.x - 14}px;top:${sp.y - 8}px;width:68px;height:56px;display:flex;align-items:center;justify-content:center;pointer-events:none;`
        const spriteSpan = document.createElement('span')
        spriteSpan.className = `pokesprite pokemon ${sp.pokemonName}`
        spriteSpan.style.imageRendering = 'pixelated'
        div.appendChild(spriteSpan)
        inner.appendChild(div)
      }

      const fallback = container.querySelector('.pretext-fallback') as HTMLElement
      if (fallback) fallback.style.display = 'none'
      inner.style.opacity = '1'
    } catch (e) {
      console.error('[PretextBio] layout failed:', e)
    }
  })
</script>

<div bind:this={container} class="pretext-bio {className}">
  <div class="pretext-bio-inner hidden" style="position:relative;opacity:0;transition:opacity 0.5s ease-out;"></div>
  <div class="pretext-fallback prose max-w-none" style="transition:opacity 0.3s ease-out;">
    {#each text.split('\n\n') as para}
      <p>{para}</p>
    {/each}
  </div>
</div>

<style>
  .pretext-bio {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .pretext-bio :global(.pretext-bio-inner) {
    font-family: 'Fira Code', monospace;
    font-size: 16px;
    line-height: 26px;
  }
</style>
