<!--
  "Present": an article's `---`-separated sections (remark-slide-split) shown one at a time, full screen.
  The article is never re-rendered: slides are the same nodes, restyled. Inactive slides stay laid out (only
  `visibility: hidden`), so embeds inside them measure real sizes; `slide-deck-active` fires on every change.
  Enter with `p`, the button, `?present` or the older `?mode=slides`; `slide=N` picks the slide.
-->
<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onMount, tick } from 'svelte'
  import { replaceState } from '$app/navigation'
  import '$lib/slides/slide-theme.css'

  let { children }: { title?: string; path?: string; children?: Snippet } = $props()

  let viewport = $state<HTMLElement>()
  let slides: HTMLElement[] = []
  let count = $state(0)
  let cur = $state(0)
  let presenting = $state(false)

  let lastFocus: HTMLElement | null = null
  let lastScroll = 0
  let entered = 0
  let benched: HTMLElement[] = []
  let touch: { x: number; y: number } | null = null

  let progress = $derived(count > 1 ? (cur / (count - 1)) * 100 : 0)

  const SELF_PANNING = 'pre, canvas, .mermaid, .mm, .katex-display, .an-code, .yk-stage, [data-no-swipe]'

  const typing = (t: EventTarget | null) =>
    t instanceof HTMLElement && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)
  const modalOpen = () => !!document.querySelector('[aria-modal="true"], dialog[open]')

  function setUrl(on: boolean) {
    const q = new URLSearchParams(location.search)
    for (const k of ['present', 'mode', 'slide']) q.delete(k)
    const rest = q.toString()
    const deck = on ? ['present', cur ? `slide=${cur}` : ''] : []
    const search = [...deck, rest].filter(Boolean).join('&')
    try {
      replaceState(`${location.pathname}${search ? `?${search}` : ''}${location.hash}`, {})
    } catch {
      // the router isn't ready during the first mount; the next change writes the URL
    }
  }

  /** Everything around the deck, up to the page shell, is inert while presenting. Modals at the body stay usable. */
  function bench(on: boolean) {
    if (!on) {
      benched.forEach((el) => (el.inert = false))
      benched = []
      return
    }
    const stop = viewport!.closest('.page') ?? document.body
    for (let el: HTMLElement = viewport!; el !== stop && el.parentElement; el = el.parentElement) {
      for (const sib of el.parentElement.children) {
        if (sib !== el && sib instanceof HTMLElement && !sib.inert) {
          sib.inert = true
          benched.push(sib)
        }
      }
    }
  }

  function paint(focus = true) {
    slides.forEach((s, i) => {
      s.classList.toggle('active', presenting && i === cur)
      s.classList.toggle('gone', presenting && i < cur)
      s.inert = presenting && i !== cur
    })
    if (!presenting) return
    slides[cur].scrollTop = 0
    if (focus) slides[cur].focus({ preventScroll: true })
    viewport!.dispatchEvent(new CustomEvent('slide-deck-active', { bubbles: true, detail: cur }))
  }

  function go(i: number) {
    if (i < 0 || i >= count || i === cur) return
    cur = i
    paint()
    setUrl(true)
  }

  async function present(on: boolean, at?: number) {
    if (on === presenting || !count) return
    if (on) {
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      lastScroll = scrollY
      const y = innerHeight * 0.3
      cur = at ?? Math.max(0, slides.findIndex((s) => s.getBoundingClientRect().bottom > y))
      cur = Math.min(count - 1, Math.max(0, cur))
      entered = cur
      presenting = true
      document.body.classList.add('deck-presentation-active')
      bench(true)
      await tick()
      if (!viewport) return
      paint()
      setUrl(true)
    } else {
      presenting = false
      bench(false)
      paint(false)
      document.body.classList.remove('deck-presentation-active')
      setUrl(false)
      await tick()
      // back where the reader left off, unless they moved to another slide
      if (cur === entered) scrollTo({ top: lastScroll, behavior: 'instant' })
      else slides[cur].scrollIntoView({ block: 'start', behavior: 'instant' })
      const back = lastFocus?.isConnected && lastFocus !== document.body ? lastFocus : viewport?.querySelector<HTMLElement>('.deck-go')
      back?.focus({ preventScroll: true })
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || typing(e.target) || modalOpen()) return
    if (!presenting) {
      if (e.key === 'p' && !e.repeat) {
        e.preventDefault()
        void present(true)
      }
      return
    }
    const onControl = e.target instanceof Element && !!e.target.closest('button, a, summary, [role="button"]')
    const k = e.key
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !onControl)) go(cur + 1)
    else if (k === 'ArrowLeft' || k === 'PageUp') go(cur - 1)
    else if (k === 'Home') go(0)
    else if (k === 'End') go(count - 1)
    else if (k === 'Escape') void present(false)
    else return
    e.preventDefault()
  }

  function onTouchStart(e: TouchEvent) {
    const t = e.target instanceof Element ? e.target : null
    touch = presenting && e.touches.length === 1 && !t?.closest(SELF_PANNING) ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null
  }

  function onTouchEnd(e: TouchEvent) {
    if (!touch) return
    const dx = e.changedTouches[0].clientX - touch.x
    const dy = e.changedTouches[0].clientY - touch.y
    touch = null
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1))
  }

  onMount(() => {
    // direct children only: embeds can contain their own <section class="slide">
    slides = [...viewport!.querySelectorAll<HTMLElement>(':scope > section.slide')]
    count = slides.length
    slides.forEach((s, i) => {
      s.tabIndex = -1
      s.setAttribute('aria-roledescription', 'slide')
      s.setAttribute('aria-label', `${i + 1} of ${count}`)
    })
    const q = new URLSearchParams(location.search)
    if (q.has('present') || q.get('mode') === 'slides') {
      const n = parseInt(q.get('slide') ?? '', 10)
      void present(true, Number.isFinite(n) ? n : 0)
    }
    // plain listeners: as a delegated <svelte:window> handler this ran several times per key press
    addEventListener('keydown', onKeydown)
    addEventListener('touchstart', onTouchStart, { passive: true })
    addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      removeEventListener('keydown', onKeydown)
      removeEventListener('touchstart', onTouchStart)
      removeEventListener('touchend', onTouchEnd)
      bench(false)
      document.body.classList.remove('deck-presentation-active')
    }
  })
</script>

<div
  class="slide-deck-viewport"
  class:slide-deck-viewport--presenting={presenting}
  role={presenting ? 'region' : undefined}
  aria-roledescription={presenting ? 'slide deck' : undefined}
  aria-label={presenting ? 'Slide deck' : undefined}
  bind:this={viewport}>
  <p class="deck-cue" hidden={presenting}>
    <button class="pill deck-go" type="button" aria-keyshortcuts="p" onclick={() => present(true)}>present ▸</button>
    <span>or press <kbd>p</kbd> to read this as slides</span>
  </p>
  {@render children?.()}
  <div class="deck-ui" hidden={!presenting}>
    <div class="deck-thread" aria-hidden="true">
      <b style="width: {progress}%"></b>
      {#each { length: count } as _, i}
        <i class:on={i < cur} class:here={i === cur} style="left: {count > 1 ? (i / (count - 1)) * 100 : 0}%"></i>
      {/each}
    </div>
    <div class="deck-n" aria-live="polite" aria-atomic="true">{cur + 1} / {count}</div>
    <button class="pill deck-x" type="button" onclick={() => present(false)}>esc<span class="deck-x-more"> · back to article</span></button>
  </div>
</div>
