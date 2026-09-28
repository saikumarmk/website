<script lang="ts" module>
  type Mermaid = typeof import('mermaid').default
  let lib: Promise<Mermaid> | undefined
  const loadMermaid = () => (lib ??= import('mermaid').then(m => m.default))
  let nextId = 0
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  let { graph, caption = '' }: { graph: string; caption?: string } = $props()

  let figure: HTMLElement | undefined = $state()
  let container: HTMLElement | undefined = $state()
  let seen = $state(false)
  let status = $state<'idle' | 'loading' | 'done' | 'failed'>('idle')
  /** Ignore async completions after a newer render started or the node was torn down. */
  let renderGeneration = 0

  function themeVariables() {
    const style = getComputedStyle(document.documentElement)
    const css = (name: string) => style.getPropertyValue(name).trim()
    return {
      fontFamily: css('--serif'),
      fontSize: '15px',
      background: css('--bg'),
      primaryColor: css('--bg'),
      primaryTextColor: css('--fg'),
      primaryBorderColor: css('--r3'),
      secondaryColor: css('--panel'),
      tertiaryColor: css('--panel'),
      lineColor: css('--g2'),
      textColor: css('--fg'),
      edgeLabelBackground: css('--bg'),
      clusterBkg: css('--panel'),
      clusterBorder: css('--rule'),
      noteBkgColor: css('--panel'),
      noteBorderColor: css('--g1'),
      noteTextColor: css('--fg2'),
      actorBkg: css('--bg'),
      actorBorder: css('--r3'),
      actorTextColor: css('--fg'),
      actorLineColor: css('--rule'),
      signalColor: css('--fg2'),
      signalTextColor: css('--fg')
    }
  }

  /** Top-level deck slide only — `closest('section.slide')` can hit nested sections (e.g. Mermaid/HTML). */
  function deckSlideSection(el: HTMLElement | undefined): HTMLElement | null {
    let cur: HTMLElement | null = el ?? null
    while (cur) {
      if (cur.matches('section.slide') && cur.parentElement?.classList.contains('slide-deck-viewport')) return cur
      cur = cur.parentElement
    }
    return null
  }

  /** In deck mode, inactive slides are `visibility:hidden`; Mermaid must render after the slide is active. */
  function shouldDeferRender(): boolean {
    if (!figure?.closest('.slide-deck-viewport--presenting')) return false
    const slide = deckSlideSection(figure)
    return !!slide && !slide.classList.contains('active')
  }

  async function render() {
    if (!seen || !container || shouldDeferRender()) return
    const gen = ++renderGeneration
    if (status !== 'done') status = 'loading'
    try {
      const mermaid = await loadMermaid()
      mermaid.initialize({ startOnLoad: false, theme: 'base', securityLevel: 'strict', themeVariables: themeVariables() })
      const { svg } = await mermaid.render(`mermaid-${++nextId}`, graph)
      if (gen !== renderGeneration || !container?.isConnected) return
      // eslint-disable-next-line svelte/no-dom-manipulating -- Mermaid hands back an SVG string for a container Svelte leaves empty
      container.innerHTML = svg
      container.querySelector('svg')?.setAttribute('aria-label', caption || 'Diagram')
      status = 'done'
    } catch (e) {
      console.error('[Mermaid]', e)
      if (gen !== renderGeneration || !container?.isConnected) return
      // eslint-disable-next-line svelte/no-dom-manipulating
      container.textContent = 'This diagram could not be drawn.'
      status = 'failed'
    }
  }

  $effect(() => {
    void graph
    void seen
    void render()
  })

  onMount(() => {
    const io = new IntersectionObserver(
      entries => {
        if (!entries.some(e => e.isIntersecting)) return
        io.disconnect()
        seen = true
      },
      { rootMargin: '300px' }
    )
    if (figure) io.observe(figure)

    const schedule = () => requestAnimationFrame(() => void render())
    const themeObserver = new MutationObserver(schedule)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const slide = deckSlideSection(figure)
    const deckViewport = figure?.closest('.slide-deck-viewport')
    const deckObservers: MutationObserver[] = []
    deckViewport?.addEventListener('slide-deck-active', schedule)
    for (const el of [slide, deckViewport]) {
      if (!el) continue
      const mo = new MutationObserver(schedule)
      mo.observe(el, { attributes: true, attributeFilter: ['class'] })
      deckObservers.push(mo)
    }

    return () => {
      renderGeneration++
      io.disconnect()
      themeObserver.disconnect()
      deckViewport?.removeEventListener('slide-deck-active', schedule)
      deckObservers.forEach(mo => mo.disconnect())
    }
  })
</script>

<figure bind:this={figure} class="diagram wide">
  <div bind:this={container} class="mermaid" class:loading={status === 'idle' || status === 'loading'}></div>
  {#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
  .diagram {
    margin-block: 1.8rem;
  }
  .mermaid {
    min-height: 6rem;
    display: flex;
    justify-content: center;
    overflow-x: auto;
    padding: 1rem 0.5rem;
    border: 1px solid var(--rule);
    border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 55%, var(--bg));
    color: var(--muted);
  }
  .mermaid.loading::before {
    content: 'sewing the diagram…';
    align-self: center;
    font-family: var(--mono);
    font-size: 12px;
  }
  .mermaid :global(svg) {
    max-width: 100%;
    height: auto;
  }
  figcaption {
    margin-top: 0.45rem;
    font-size: 15px;
    font-style: italic;
    color: var(--muted);
  }
</style>
