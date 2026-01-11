<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import mermaid from 'mermaid'

  export let graph: string

  let container: HTMLElement
  let observer: MutationObserver
  let uniqueId = `mermaid-${Math.random().toString(36).substring(2, 15)}`

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

  async function renderMermaid() {
    if (!browser || !container) return

    const themeVariables = getThemeVariables()

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables
    })

    const { svg } = await mermaid.render(uniqueId, graph)
    container.innerHTML = ''
    container.innerHTML = svg
  }

  onMount(() => {
    renderMermaid()

    observer = new MutationObserver(() => renderMermaid())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
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
