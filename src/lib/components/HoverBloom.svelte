<!--
  Hovering any post row with `data-slug={post.path}` sews that post's flower into the margin beside it.
  One SVG for the whole page, driven by event delegation. Hidden below 60rem and for touch.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'
  import { posts } from '$lib/stores/posts'
  import { readMins } from '$lib/config/topics'
  import { render, seeded, sew, NAMES } from '$lib/thread'

  const W = 130
  const H = 96

  let host = $state<HTMLElement>()
  let svg = $state<SVGSVGElement>()
  let on = $state(false)
  let top = $state(0)
  let left = $state(0)
  let slug = $state<string | null>(null)

  const norm = (p: string) => '/' + p.replace(/^\/+|\/+$/g, '')
  const post = $derived(slug ? ($posts ?? []).find((p) => norm(p.path) === slug) : undefined)
  const piece = $derived.by(() => {
    if (!post) return undefined
    const sd = seeded(post.seed ?? post.path)
    const r = render((b, w, h) => b.specimen(w / 2, h * 0.42, 32, sd.rng), W, H, 2.4)
    return { ...r, palette: sd.palette, label: `${NAMES[r.result]} · ${readMins(post.words)} min` }
  })

  $effect(() => {
    if (piece && svg) svg.dispatchEvent(new Event('thread:resew'))
  })

  afterNavigate(() => {
    on = false
    slug = null
  })

  onMount(() => {
    const wide = matchMedia('(min-width: 60rem) and (hover: hover)')
    let timer: ReturnType<typeof setTimeout> | undefined
    let row: HTMLElement | null = null

    const show = (el: HTMLElement) => {
      const page = host?.offsetParent ?? document.body
      const pr = page.getBoundingClientRect()
      const r = (el.querySelector('.row') ?? el).getBoundingClientRect()
      const col = el.closest('.col') ?? el
      top = r.top + r.height / 2 - pr.top
      left = col.getBoundingClientRect().right - pr.left
      slug = norm(el.dataset.slug ?? '')
      on = true
    }
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !wide.matches) return
      const el = (e.target as Element).closest?.<HTMLElement>('[data-slug]')
      if (el === row) return
      row = el
      clearTimeout(timer)
      if (el) timer = setTimeout(() => show(el), 60)
      else on = false
    }
    const onLeave = () => {
      clearTimeout(timer)
      row = null
      on = false
    }
    document.addEventListener('pointerover', onOver)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  })
</script>

<div class="hover-bloom" class:on={on && !!piece} style:top="{top}px" style:left="{left}px" bind:this={host} aria-hidden="true">
  <svg
    bind:this={svg}
    class="thread-svg pal-{piece?.palette ?? 'ado'}"
    viewBox="0 0 {W} {H}"
    data-sew
    use:sew={{ duration: piece?.duration ?? 0, manual: true }}>
    {#if piece}{@html piece.html}{/if}
  </svg>
  {#if piece}<span>{piece.label}</span>{/if}
</div>

<style>
  .hover-bloom {
    position: absolute;
    top: 0;
    left: 0;
    margin-left: var(--gap);
    width: 10rem;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transform: translate(-0.4rem, -50%);
    transition:
      opacity 0.25s,
      transform 0.35s cubic-bezier(0.2, 0.9, 0.25, 1.1),
      visibility 0s 0.35s;
    z-index: 2;
  }
  .hover-bloom.on {
    opacity: 1;
    visibility: visible;
    transform: translate(0, -50%);
    transition:
      opacity 0.25s,
      transform 0.35s cubic-bezier(0.2, 0.9, 0.25, 1.1);
  }
  svg {
    width: 10rem;
    height: 7.4rem;
    margin-left: -1rem;
  }
  span {
    display: block;
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--muted);
    margin-top: 0.2rem;
    white-space: nowrap;
  }
  @media (max-width: 59.99rem), (hover: none) {
    .hover-bloom {
      display: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .hover-bloom,
    .hover-bloom.on {
      transform: translate(0, -50%);
    }
  }
  @media print {
    .hover-bloom {
      display: none;
    }
  }
</style>
