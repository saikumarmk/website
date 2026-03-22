<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte'
  import { browser } from '$app/environment'
  import '$lib/slides/slide-theme.css'

  export let title = ''
  export let path = ''

  let viewport: HTMLElement
  let slides: HTMLElement[] = []
  let current = 0
  let slidesMode = false
  let touchStartX = 0

  $: slideCount = slides.length
  $: progressPct = slideCount > 1 ? (current / (slideCount - 1)) * 100 : 0

  $: if (browser && viewport) {
    applyMode(slidesMode)
  }

  function collectSlides() {
    if (!viewport) return
    slides = Array.from(viewport.querySelectorAll(':scope > section.slide'))
  }

  function applyMode(presenting: boolean) {
    collectSlides()
    if (slides.length === 0) return

    if (presenting) {
      document.body.classList.add('deck-presentation-active')
      for (const s of slides) s.classList.remove('active', 'exit-up')
      current = 0
      slides[0].classList.add('active')
    } else {
      document.body.classList.remove('deck-presentation-active')
      for (const s of slides) s.classList.remove('active', 'exit-up')
    }
  }

  function goTo(index: number) {
    if (index < 0 || index >= slides.length) return
    const prev = slides[current]
    prev.classList.remove('active')
    if (index > current) prev.classList.add('exit-up')
    setTimeout(() => prev.classList.remove('exit-up'), 450)

    current = index
    slides[current].classList.add('active')
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

  onMount(async () => {
    const { page } = await import('$app/stores')
    slidesMode = window.location.search.includes('mode=slides')
    await tick()
    applyMode(slidesMode)

    const unsub = page.subscribe($p => {
      const newMode = $p.url.searchParams.get('mode') === 'slides'
      if (newMode !== slidesMode) {
        slidesMode = newMode
        applyMode(slidesMode)
      }
    })

    return () => unsub()
  })

  onDestroy(() => {
    if (browser) document.body.classList.remove('deck-presentation-active')
  })
</script>

<svelte:window on:keydown={onKeydown} on:touchstart={onTouchStart} on:touchend={onTouchEnd} />

{#if !slidesMode}
  <a href="{path}?mode=slides" class="slide-deck-present-btn btn btn-primary btn-sm gap-2">
    <span class="i-heroicons-outline-presentation-chart-bar w-4 h-4" />
    Present Slides
  </a>
{/if}

<div
  class="slide-deck-viewport"
  class:slide-deck-viewport--presenting={slidesMode}
  bind:this={viewport}>
  <slot />
  {#if slidesMode}
    <div class="slide-deck-progress-bar" aria-hidden="true" style="width: {progressPct}%;" />
    <div class="slide-deck-counter font-mono" aria-live="polite">
      {current + 1} / {slideCount || '…'}
    </div>
  {/if}
</div>
