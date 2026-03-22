<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import mermaid from 'mermaid'

  let { graph } = $props()

  let container: HTMLElement | undefined
  let observer: MutationObserver
  let uniqueId = `mermaid-${Math.random().toString(36).substring(2, 15)}`
  /** Ignore async completions after a newer render started or the node was torn down. */
  let renderGeneration = 0

  function hslStringToHex(hsl: string): string {
    const [h, s, l] = hsl.replaceAll('%', '').trim().split(/\s+/).map(Number)

    const a = (s * Math.min(l, 100 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round((255 * color) / 100)
        .toString(16)
        .padStart(2, '0')
    }

    return `#${f(0)}${f(8)}${f(4)}`
  }

  function getThemeVariables() {
    const style = getComputedStyle(document.documentElement)
    const get = (name: string) => style.getPropertyValue(name).trim()

    // Get base colors
    const bgColor = hslStringToHex(get('--b1'))
    const primaryColor = hslStringToHex(get('--p'))
    const textColor = hslStringToHex(get('--bc'))
    const secondaryColor = hslStringToHex(get('--s') || get('--b2'))
    const accentColor = hslStringToHex(get('--a') || get('--p'))

    return {
      // Background colors
      background: bgColor,
      
      // Primary node colors - use lighter bg with dark text for contrast
      primaryColor: primaryColor,
      primaryTextColor: '#ffffff', // Force white text on primary color nodes
      primaryBorderColor: primaryColor,
      
      // Secondary colors
      secondaryColor: secondaryColor,
      secondaryTextColor: textColor,
      secondaryBorderColor: secondaryColor,
      
      // Tertiary/accent colors
      tertiaryColor: bgColor,
      tertiaryTextColor: textColor,
      tertiaryBorderColor: accentColor,
      
      // Line and edge colors
      lineColor: textColor,
      textColor: textColor,
      
      // Node styling
      nodeBorder: primaryColor,
      nodeTextColor: textColor,
      
      // Edge labels
      edgeLabelBackground: bgColor,
      
      // Cluster/subgraph styling
      clusterBkg: bgColor,
      clusterBorder: primaryColor,
      
      // Gantt chart specific - ensure contrast
      sectionBkgColor: bgColor,
      altSectionBkgColor: secondaryColor,
      sectionBkgColor2: bgColor,
      taskTextColor: '#ffffff', // White text on colored bars
      taskTextOutsideColor: textColor,
      taskTextClickableColor: '#ffffff',
      activeTaskBorderColor: accentColor,
      gridColor: textColor,
      doneTaskBkgColor: primaryColor,
      
      // Timeline specific
      cScale0: primaryColor,
      cScale1: secondaryColor,
      cScale2: accentColor
    }
  }

  /** Top-level deck slide only — `closest('section.slide')` can hit nested sections (e.g. Mermaid/HTML). */
  function deckSlideSection(el: HTMLElement | undefined): HTMLElement | null {
    if (!el) return null
    let cur: HTMLElement | null = el
    while (cur) {
      if (cur.matches('section.slide')) {
        const p = cur.parentElement
        if (p?.classList.contains('slide-deck-viewport')) return cur
      }
      cur = cur.parentElement
    }
    return null
  }

  /** In deck mode, inactive slides are `visibility:hidden`; Mermaid must render after the slide is active. */
  function shouldDeferRender(): boolean {
    const deck = container?.closest('.slide-deck-viewport--presenting')
    if (!deck) return false
    const slide = deckSlideSection(container)
    if (!slide) return false
    return !slide.classList.contains('active')
  }

  async function renderMermaid() {
    if (!browser || !container) return
    if (shouldDeferRender()) return

    const gen = ++renderGeneration

    try {
      let themeVariables
      try {
        themeVariables = getThemeVariables()
      } catch {
        themeVariables = {}
      }

      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables
      })

      const { svg } = await mermaid.render(uniqueId, graph)
      if (gen !== renderGeneration || !container?.isConnected) return
      container.innerHTML = ''
      container.innerHTML = svg
    } catch (e) {
      console.error('[Mermaid]', e)
      if (gen !== renderGeneration || !container?.isConnected) return
      container.innerHTML = `<p class="text-error text-sm">Diagram failed to render.</p>`
    }
  }

  $effect(() => {
    graph
    void renderMermaid()
  })

  onMount(() => {
    observer = new MutationObserver(() => renderMermaid())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    const slide = deckSlideSection(container)
    const deckViewport = container?.closest('.slide-deck-viewport')
    let slideObserver: MutationObserver | undefined
    let deckObserver: MutationObserver | undefined

    const scheduleRender = () => {
      requestAnimationFrame(() => void renderMermaid())
    }

    const onDeckSlide = () => scheduleRender()
    deckViewport?.addEventListener('slide-deck-active', onDeckSlide)

    if (slide) {
      slideObserver = new MutationObserver(scheduleRender)
      slideObserver.observe(slide, { attributes: true, attributeFilter: ['class'] })
    }
    if (deckViewport) {
      deckObserver = new MutationObserver(scheduleRender)
      deckObserver.observe(deckViewport, { attributes: true, attributeFilter: ['class'] })
    }

    scheduleRender()

    return () => {
      deckViewport?.removeEventListener('slide-deck-active', onDeckSlide)
      observer?.disconnect()
      slideObserver?.disconnect()
      deckObserver?.disconnect()
    }
  })

  onDestroy(() => {
    observer?.disconnect()
  })
</script>

<div bind:this={container} class="mermaid flex justify-center" />

<style>
  .mermaid :global(svg) {
    max-width: 100%;
    height: auto;
  }
</style>
