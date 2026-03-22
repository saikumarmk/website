<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import '$lib/slides/slide-theme.css'

  let { title = '', path = '', children } = $props()

  let viewport: HTMLElement
  let slides: HTMLElement[] = []
  let current = $state(0)
  let slideCount = $state(0)
  let slidesMode = $state(false)
  let touchStartX = 0

  let progressPct = $derived(slideCount > 1 ? (current / (slideCount - 1)) * 100 : 0)

  function collectSlides() {
    if (!viewport) return
    // Descendants, not only direct children — Svelte may insert fragment markers; `> section` can miss slides.
    slides = Array.from(viewport.querySelectorAll('section.slide'))
    slideCount = slides.length
  }

  function notifySlideChange() {
    if (!browser || !viewport) return
    viewport.dispatchEvent(new CustomEvent('slide-deck-active', { bubbles: true }))
  }

  function readSlideIndexFromSearch(search: string): number {
    const raw = new URLSearchParams(search).get('slide')
    const n = raw === null || raw === '' ? 0 : parseInt(raw, 10)
    return Number.isFinite(n) ? n : 0
  }

  function applyMode(presenting: boolean) {
    collectSlides()
    if (slides.length === 0) return

    if (presenting) {
      document.body.classList.add('deck-presentation-active')
      for (const s of slides) s.classList.remove('active', 'exit-up')
      const search = browser ? window.location.search : ''
      const idx = Math.max(0, Math.min(slides.length - 1, readSlideIndexFromSearch(search)))
      current = idx
      slides[current].classList.add('active')
    } else {
      document.body.classList.remove('deck-presentation-active')
      for (const s of slides) s.classList.remove('active', 'exit-up')
    }
    notifySlideChange()
  }

  function goTo(index: number, opts?: { fromUrl?: boolean }) {
    if (index < 0 || index >= slides.length) return
    const prevSlide = slides[current]
    prevSlide.classList.remove('active')
    if (index > current) prevSlide.classList.add('exit-up')
    setTimeout(() => prevSlide.classList.remove('exit-up'), 450)

    current = index
    slides[current].classList.add('active')
    notifySlideChange()
    if (slidesMode && browser && !opts?.fromUrl) {
      void goto(`?mode=slides&slide=${index}`, { replaceState: true, noScroll: true })
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (!slidesMode) return
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault()
        goTo(current + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        goTo(current - 1)
        break
      case 'Home':
        e.preventDefault()
        goTo(0)
        break
      case 'End':
        e.preventDefault()
        goTo(slides.length - 1)
        break
      case 'Escape':
        e.preventDefault()
        window.location.href = path
        break
    }
  }

  function onTouchStart(e: TouchEvent) {
    if (!slidesMode) return
    touchStartX = e.touches[0].clientX
  }

  function onTouchEnd(e: TouchEvent) {
    if (!slidesMode) return
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 50) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1)
    }
  }

  onMount(() => {
    let unsub: (() => void) | undefined
    slidesMode = browser && window.location.search.includes('mode=slides')
    void tick().then(async () => {
      applyMode(slidesMode)
      await tick()
      unsub = page.subscribe($p => {
        if (!browser) return
        const newMode = $p.url.searchParams.get('mode') === 'slides'
        if (newMode !== slidesMode) {
          slidesMode = newMode
          applyMode(slidesMode)
          return
        }
        if (!newMode || slides.length === 0) return
        const idx = Math.max(
          0,
          Math.min(slides.length - 1, readSlideIndexFromSearch($p.url.search))
        )
        if (idx !== current) goTo(idx, { fromUrl: true })
      })
    })
    return () => unsub?.()
  })

  onDestroy(() => {
    if (browser) document.body.classList.remove('deck-presentation-active')
  })
</script>

<svelte:window onkeydown={onKeydown} ontouchstart={onTouchStart} ontouchend={onTouchEnd} />

{#if !slidesMode}
  <a href="{path}?mode=slides" class="slide-deck-present-btn btn btn-primary btn-sm gap-2">
    <span class="i-heroicons-outline-presentation-chart-bar w-4 h-4" />
    Present Slides
  </a>
{/if}

<div
  class="slide-deck-viewport"
  class:slide-deck-viewport--presenting={slidesMode}
  class:deck-root={slidesMode}
  class:deck-slides={slidesMode}
  role={slidesMode ? 'region' : undefined}
  aria-label={slidesMode ? 'Slide deck' : undefined}
  bind:this={viewport}>
  {@render children?.()}
  {#if slidesMode}
    <div class="slide-deck-progress-bar" aria-hidden="true" style="width: {progressPct}%;" />
    <div class="slide-deck-counter font-mono" aria-live="polite">
      {current + 1} / {slideCount || '…'}
    </div>
  {/if}
</div>
