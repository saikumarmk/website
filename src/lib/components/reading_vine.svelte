<!--
  The post's contents as a vine down the left edge (80rem and up): the stem grows with reading progress,
  each top-level section puts out a labelled leaf, and the last one opens a rose.
  Below 80rem the progress shows as a gold running stitch along the top instead.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { render } from '$lib/thread'
  import { satinSelect } from '$lib/actions/satin-select'

  import { sectionsOf, type TocEntry } from '$lib/utils/toc'

  let { toc = [], article }: { toc?: TocEntry[] | false; article?: HTMLElement } = $props()

  const sections = $derived(sectionsOf(toc))

  let H = $state(0)
  let progress = $state(0)
  let current = $state(0)

  const W = 90
  const stemX = (y: number) => 62 + 9 * Math.sin(y / 70)
  const stem = $derived.by(() => {
    const pts: [number, number][] = []
    for (let y = -10; y <= H + 10; y += 8) pts.push([stemX(y), y])
    let len = 0
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    return { d: 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L'), len }
  })

  const marks = $derived.by(() => {
    const n = sections.length
    return sections.map((s, i) => {
      const last = i === n - 1
      const y = H * (0.14 + 0.72 * (i / Math.max(1, n - 1)))
      const x = stemX(y)
      const left = Math.round(x + (last ? 26 : 6))
      const piece = last
        ? render((b, w, h) => b.rose(w / 2, h / 2, 26, { petals: 12, turn: 0.3 }), 80, 80, 1.6)
        : render((b, w, h) => b.leaf(w - 2, h * 0.7, w * 0.08, h * (i % 2 ? 0.5 : 0.22), 9, i % 2 ? -0.2 : 0.25), 60, 44, 1.6)
      return {
        ...s,
        last,
        frac: y / (H || 1),
        html: piece.html,
        art: last ? `left:${x - 40}px;top:${y - 40}px` : `left:${x - 60}px;top:${y - 30}px`,
        label: `left:${left}px;top:${Math.round(y - (last ? 0 : 6))}px;width:min(9.4rem, calc(var(--rail) - ${left}px - 0.75rem))`
      }
    })
  })

  let raf = 0
  function measure() {
    raf = 0
    if (!article) return
    const r = article.getBoundingClientRect()
    progress = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / (r.height || 1)))
    let c = 0
    sections.forEach((s, i) => {
      const el = document.getElementById(s.slug)
      if (el && el.getBoundingClientRect().top < innerHeight * 0.35) c = i
    })
    current = c
  }
  const soon = () => (raf ||= requestAnimationFrame(measure))

  onMount(() => {
    H = innerHeight
    measure()
    const onResize = () => {
      H = innerHeight
      soon()
    }
    addEventListener('scroll', soon, { passive: true })
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', soon)
      removeEventListener('resize', onResize)
    }
  })

  function jump(e: MouseEvent, slug: string) {
    const el = document.getElementById(slug)
    if (!el) return
    e.preventDefault()
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    history.replaceState(history.state, '', `#${slug}`)
  }
</script>

<div class="read-thread" style:transform="scaleX({progress})" aria-hidden="true"></div>

{#if H && sections.length}
  <nav class="vine" aria-label="Contents">
    <div class="vine-art" aria-hidden="true">
      <svg viewBox="0 0 {W} {H}" width={W} height={H} style="position:absolute;inset:0">
        <path class="track" d={stem.d} />
        <path class="stem" d={stem.d} style:stroke-dasharray={stem.len} style:stroke-dashoffset={stem.len * (1 - progress)} />
      </svg>
      {#each marks as m (m.slug)}
        <svg
          class="thread-svg {m.last ? 'vr' : 'vl'}"
          class:sew={progress >= m.frac - 0.001}
          data-sew
          viewBox={m.last ? '0 0 80 80' : '0 0 60 44'}
          style={m.art}>
          {@html m.html}
        </svg>
      {/each}
    </div>
    <div class="vine-menu" use:satinSelect={{ items: 'a', selected: current }}>
      <div class="vine-labels">
        {#each marks as m (m.slug)}
          <a href="#{m.slug}" style={m.label} class:reached={progress >= m.frac - 0.001} onclick={e => jump(e, m.slug)}>
            {m.title}
          </a>
        {/each}
      </div>
    </div>
  </nav>
{/if}
