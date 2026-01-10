<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  export let graph: string

  let container: HTMLElement
  let observer: MutationObserver
  let uniqueId = `mermaid-${crypto.randomUUID()}`
  let mermaidModule: any = null

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

    return {
      background: hslStringToHex(get('--b1')),
      primaryColor: hslStringToHex(get('--p')),
      primaryTextColor: hslStringToHex(get('--bc')),
      nodeBorder: hslStringToHex(get('--p')),
      edgeLabelBackground: hslStringToHex(get('--b1')),
      clusterBkg: hslStringToHex(get('--b1')),
      clusterBorder: hslStringToHex(get('--p'))
    }
  }

  async function renderMermaid() {
    if (!browser || !container) return

    // Lazy load mermaid only when needed
    if (!mermaidModule) {
      mermaidModule = (await import('mermaid')).default
    }

    const themeVariables = getThemeVariables()

    mermaidModule.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables
    })

    const { svg } = await mermaidModule.render(uniqueId, graph)
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

<div bind:this={container} class="mermaid" />
