<!--
  Every post's flower on one cloth, a row per year. x comes from the date (relaxed so flowers
  don't collide) and the size from log(words). Rows are rendered on the server and sewn when
  they scroll into view, one row per task.
-->
<script lang="ts">
  import { goto } from '$app/navigation'
  import { posts } from '$lib/stores/posts'
  import { readSlugs, isRead } from '$lib/stores/read'
  import { readMins } from '$lib/config/topics'
  import { render, rng, seeded, sew, NAMES, type Species } from '$lib/thread'

  const W = 720
  const H = 132

  const dateOf = (p: Blog.Post) => new Date(p.published ?? p.created)
  const radius = (words = 0) => Math.max(9, Math.min(34, 9 + 8 * Math.log2(Math.max(1, words) / 350)))
  const fmt = (d: Date) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Australia/Melbourne' })
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

  interface Hit {
    post: Blog.Post
    x: number
    y: number
    r: number
    kind: Species
  }

  const listed = $derived(
    ($posts ?? []).filter((p) => p.type === 'article' && !p.flags?.includes('unlisted') && !p.path.startsWith('/growth/'))
  )

  const rows = $derived.by(() => {
    const years = [...new Set(listed.map((p) => dateOf(p).getUTCFullYear()))].sort((a, b) => b - a)
    return years.map((year) => {
      const ps = listed.filter((p) => dateOf(p).getUTCFullYear() === year).sort((a, b) => +dateOf(a) - +dateOf(b))
      const rs = ps.map((p) => radius(p.words))
      const y0 = Date.UTC(year, 0, 1)
      const xs = ps.map((p) => 50 + 620 * ((+dateOf(p) - y0) / 31536e6))
      for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + (rs[i] + rs[i - 1]) * 1.25)
      for (let i = xs.length - 1; i >= 0; i--) xs[i] = Math.min(xs[i], i === xs.length - 1 ? W - 30 - rs[i] : xs[i + 1] - (rs[i] + rs[i + 1]) * 1.25)
      const piece = render(
        (b, w, h) => {
          const g = h - 14
          const hits: Hit[] = []
          b.run(`M10 ${g} L${w - 10} ${g}`, 'g2', b.tick(0))
          ps.forEach((p, i) => {
            const sd = seeded(p.seed ?? p.path)
            const jig = rng(sd.hash ^ 0x9e3779b9)
            const x = xs[i], R = rs[i], top = g - (26 + R * 1.1 + jig() * 10)
            b.raw(`<g class="pal-${esc(sd.palette)}">`)
            b.stem(b.curve(x + (jig() - 0.5) * 6, g, x + (jig() - 0.5) * 22, (g + top) / 2, x, top))
            const kind = b.specimen(x, top, R, sd.rng, { box: [w, h] })
            b.raw('</g>')
            hits.push({ post: p, x, y: top, r: R * 1.4, kind })
          })
          return hits
        },
        W,
        H,
        3
      )
      return { year, html: piece.html, hits: piece.result, duration: piece.duration }
    })
  })

  const words = $derived(listed.reduce((a, p) => a + (p.words ?? 0), 0))

  /* Rows that come into view wait their turn, so a tall screen doesn't restyle every row in one task. */
  const queue: SVGSVGElement[] = []
  let draining: ReturnType<typeof setTimeout> | undefined
  const drain = () => {
    draining = undefined
    queue.shift()?.dispatchEvent(new Event('thread:resew'))
    if (queue.length) draining = setTimeout(drain, 16)
  }
  function sewInTurn(svg: SVGSVGElement, duration: number) {
    const s = sew(svg, { duration, manual: true })
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        queue.push(svg)
        draining ??= setTimeout(drain, 0)
      },
      { threshold: 0.15 }
    )
    io.observe(svg)
    return {
      update: (d: number) => s.update({ duration: d, manual: true }),
      destroy() {
        io.disconnect()
        s.destroy()
        const i = queue.indexOf(svg)
        if (i >= 0) queue.splice(i, 1)
      }
    }
  }

  let cloth = $state<HTMLElement>()
  let tip = $state<{ hit: Hit; left: number; top: number } | null>(null)

  const hitOf = (t: EventTarget | null) => {
    const a = (t as Element | null)?.closest?.<SVGAElement>('a[data-hit]')
    if (!a) return null
    const [r, i] = a.dataset.hit!.split(':').map(Number)
    return { a, hit: rows[r]?.hits[i] }
  }
  function showTip(e: Event) {
    const found = hitOf(e.target)
    if (!found?.hit || !cloth) return (tip = null)
    const cr = cloth.getBoundingClientRect()
    const r = (found.a.firstElementChild ?? found.a).getBoundingClientRect()
    tip = {
      hit: found.hit,
      left: Math.max(140, Math.min(cloth.scrollWidth - 140, r.left + r.width / 2 - cr.left + cloth.scrollLeft)),
      top: r.top - cr.top + 6
    }
  }
  function onKey(e: KeyboardEvent) {
    if (e.key !== ' ') return
    const found = hitOf(e.target)
    if (!found?.hit) return
    e.preventDefault()
    goto(found.hit.post.path)
  }
</script>

<svelte:head>
  <title>The garden | saikumarmk.com</title>
  <meta name="description" content="Every post's flower, sewn onto one cloth." />
</svelte:head>

<div class="head">
  <h1>The garden</h1>
  <p>
    Every post's flower, sewn onto one cloth. Each row is a year, and longer posts grow bigger flowers.
    <span class="wide-only">Hover for the label; click to read.</span><span class="narrow-only">Swipe along the rows; tap a flower to read.</span>
  </p>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="cloth"
  bind:this={cloth}
  onpointerover={showTip}
  onpointerleave={() => (tip = null)}
  onfocusin={showTip}
  onfocusout={() => (tip = null)}
  onkeydown={onKey}>
  {#each rows as row, r (row.year)}
    <div class="bed">
      <div class="yr" aria-hidden="true">{row.year}</div>
      <svg class="thread-svg" viewBox="0 0 {W} {H}" data-sew role="group" aria-label={String(row.year)} use:sewInTurn={row.duration}>
        <g aria-hidden="true">{@html row.html}</g>
        {#each row.hits as h, i (h.post.path)}
          <a href={h.post.path} data-hit="{r}:{i}" aria-label="{h.post.title}, {fmt(dateOf(h.post))}">
            <circle class="hit" cx={h.x.toFixed(1)} cy={h.y.toFixed(1)} r={h.r.toFixed(1)} />
          </a>
        {/each}
      </svg>
    </div>
  {/each}
  {#if tip}
    <div class="tip" style:left="{tip.left}px" style:top="{tip.top}px" aria-hidden="true">
      <b>{tip.hit.post.title}</b>
      <small>
        {fmt(dateOf(tip.hit.post))} · {readMins(tip.hit.post.words)} min · {NAMES[tip.hit.kind]}{isRead($readSlugs, tip.hit.post.path) ? ' · read' : ''}
      </small>
    </div>
  {/if}
</div>
<p class="sum">{listed.length} posts over {rows.length} years · {words.toLocaleString('en-AU')} words sewn</p>

<style>
  .head {
    margin: 4.5rem 0 1.5rem;
  }
  .head h1 {
    font-size: 2.6rem;
    margin: 0 0 0.6rem;
    font-weight: 400;
  }
  .head p {
    color: var(--fg2);
    margin: 0;
    max-width: var(--measure);
  }
  .cloth {
    position: relative;
    max-width: 64rem;
    border: 1px solid color-mix(in srgb, var(--fg2) 60%, transparent);
    border-radius: 14px;
    padding: 1.2rem 1.4rem 1.6rem;
    background:
      repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 3.5%, transparent) 3px 4px),
      repeating-linear-gradient(-45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 2.5%, transparent) 3px 4px),
      var(--panel);
  }
  .cloth::after {
    content: '';
    position: absolute;
    inset: 7px;
    border: 1.5px dashed color-mix(in srgb, var(--g1) 55%, transparent);
    border-radius: 10px;
    pointer-events: none;
  }
  .bed {
    display: grid;
    grid-template-columns: 3.4rem 1fr;
    align-items: end;
  }
  .bed + .bed {
    margin-top: 0.2rem;
  }
  .yr {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--muted);
    padding-bottom: 0.55rem;
  }
  .bed svg {
    width: 100%;
    height: auto;
    --bg: var(--panel);
  }
  .bed a {
    outline: none;
  }
  .hit {
    fill: transparent;
    stroke: none;
    pointer-events: all;
    cursor: pointer;
  }
  .bed a:focus-visible .hit {
    stroke: var(--r3);
    stroke-width: 1.5;
    stroke-dasharray: 3.4 2.6;
    stroke-linecap: round;
  }
  .tip {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    background: var(--bg);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    max-width: 17rem;
    font-size: 14.5px;
    line-height: 1.3;
    box-shadow: 0 10px 24px -16px color-mix(in srgb, var(--fg) 55%, transparent);
    transform: translate(-50%, calc(-100% - 12px));
  }
  .tip b {
    font-weight: 500;
    display: block;
  }
  .tip small {
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--muted);
  }
  .sum {
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--muted);
    margin-top: 1rem;
  }
  @media (max-width: 40rem) {
    .cloth {
      overflow-x: auto;
      padding: 0.9rem 0.8rem 1.2rem;
      margin-right: -1.25rem;
      border-right: 0;
      border-radius: 14px 0 0 14px;
    }
    .cloth::after {
      display: none;
    }
    .bed {
      min-width: 40rem;
      grid-template-columns: 2.8rem 1fr;
    }
    .yr {
      position: sticky;
      left: 0;
      z-index: 1;
      align-self: end;
      background: var(--panel);
      margin: 0 0 0.45rem -0.8rem;
      padding: 0 0.2rem 0.1rem 0.8rem;
    }
  }
</style>
