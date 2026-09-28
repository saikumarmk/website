<!--
  Yakuza 0 table explorer. The graph (static/data, ~350KB) and force-graph are fetched only when the figure
  comes near the viewport; the simulation pauses while it's off screen.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import type ForceGraphInstance from 'force-graph'
  import type { LinkObject, NodeObject } from 'force-graph'
  import { whenNear } from '$lib/actions/when-near'

  type GNode = NodeObject & { id: string; label: string; group: string; [field: string]: unknown }
  type GLink = { source: string; target: string; type?: string }
  type Graph = { nodes: GNode[]; links: GLink[]; stats?: { system_count?: number } }

  const FAMILIES = [
    { name: 'Money Island', test: /^MoneyIsland|^PropertyRank/, token: '--r3' },
    { name: 'Encounters', test: /^Encounter|^EnemyModel/, token: '--c3' },
    { name: 'Nawabari', test: /^Nawabari|^Evidence/, token: '--g1' },
    { name: 'Items', test: /^Item|^DropPool/, token: '--c2' },
    { name: 'Arena', test: /^EndlessArena/, token: '--c1' },
    { name: 'Tables', test: /./, token: '--muted' }
  ]
  const familyOf = (group: string) => FAMILIES.find(f => f.test.test(group))!
  const SKIP = new Set(['id', 'label', 'group', 'x', 'y', 'vx', 'vy', 'fx', 'fy', 'index', '__indexColor'])
  const SHOW_LINKED = 8
  const uid = `yk-${Math.random().toString(36).slice(2, 9)}`

  let figure = $state<HTMLElement>()
  let stage = $state<HTMLElement>()
  let canvas = $state<HTMLElement>()

  let status = $state('The graph loads as you reach it.')
  let failed = $state(false)
  let options = $state<string[]>([])
  let selected = $state<GNode | null>(null)
  let linked = $state<GNode[]>([])
  let linkedTotal = $state(0)
  let miss = $state('')

  let fg: ForceGraphInstance | undefined
  let nodes: GNode[] = []
  let byId = new Map<string, GNode>()
  let nbrs = new Map<string, Set<string>>()
  let hot = new Set<string>()
  let col: Record<string, string> = {}

  const N = (n: NodeObject) => n as GNode
  /** a link end is an id until the simulation swaps in the node itself */
  const endId = (end: LinkObject['source']) => String(typeof end === 'object' ? end.id : end)
  const size = (n: GNode) => (n.group === 'System' ? 2.2 : n.group === 'Item' ? 3 : n.group === 'NawabariShopType' ? 1.6 : 3.4)

  let fields = $derived(
    selected
      ? Object.entries(selected)
          .filter(([k, v]) => !SKIP.has(k) && v !== '' && v != null)
          .map(([k, v]) => [k.replace(/_/g, ' '), show(v)] as const)
      : []
  )

  function show(v: unknown): string {
    if (v && typeof v === 'object' && !Array.isArray(v))
      return Object.entries(v)
        .map(([k, x]) => `${k}: ${x}`)
        .join(' · ')
    return Array.isArray(v) ? v.join(', ') : String(v)
  }

  function readColours() {
    const css = getComputedStyle(document.documentElement)
    const v = (name: string) => css.getPropertyValue(name).trim()
    col = Object.fromEntries(FAMILIES.map(f => [f.name, v(f.token)]))
    Object.assign(col, { rule: v('--rule'), gold: v('--g1'), fg: v('--fg'), panel: v('--panel') })
  }

  /** force-graph only repaints a settled graph when something changes; nudging the zoom is that change */
  const repaint = () => fg?.zoom(fg.zoom())

  function select(n: GNode | null, fly = false) {
    selected = n
    miss = ''
    hot = n ? new Set([n.id, ...(nbrs.get(n.id) ?? [])]) : new Set()
    const ids = n ? [...(nbrs.get(n.id) ?? [])] : []
    linkedTotal = ids.length
    linked = ids.slice(0, SHOW_LINKED).map(id => byId.get(id)!)
    if (n && fly && n.x != null && n.y != null) {
      const z = Math.max(fg?.zoom() ?? 1, 2.4)
      // on narrow screens the detail sheet covers the lower half, so the knot sits higher
      const lift = stage && stage.clientWidth < 640 ? (stage.clientHeight * 0.25) / z : 0
      fg?.centerAt(n.x, (n.y ?? 0) + lift, 600)
      fg?.zoom(z, 600)
    } else repaint()
  }

  function find(e: Event) {
    const q = (e.currentTarget as HTMLInputElement).value.trim().toLowerCase()
    if (!q) return
    const n = nodes.find(m => m.label.toLowerCase() === q) ?? nodes.find(m => m.label.toLowerCase().includes(q))
    if (n) select(n, true)
    else miss = `Nothing called “${q}” in the graph.`
  }

  function onStageKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && selected) {
      e.preventDefault()
      select(null)
    }
  }

  async function build() {
    status = 'Loading the graph…'
    try {
      const [data, { default: ForceGraph }] = await Promise.all([
        fetch('/data/yakuza0-archaeology-graph.json').then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json() as Promise<Graph>
        }),
        import('force-graph')
      ])
      if (!canvas || !stage) return
      nodes = data.nodes
      const links = data.links.map(l => ({ ...l }))
      byId = new Map(nodes.map(n => [n.id, n]))
      nbrs = new Map(nodes.map(n => [n.id, new Set<string>()]))
      for (const l of links) {
        nbrs.get(endId(l.source))?.add(endId(l.target))
        nbrs.get(endId(l.target))?.add(endId(l.source))
      }
      status = `${nodes.length} nodes · ${links.length.toLocaleString('en-AU')} edges · ${data.stats?.system_count ?? 0} table families`
      options = [...new Set(nodes.filter(n => n.group !== 'NawabariShopType').map(n => n.label))]
      readColours()

      const touches = (l: LinkObject) => !!selected && (endId(l.source) === selected.id || endId(l.target) === selected.id)
      fg = new ForceGraph(canvas)
        .width(stage.clientWidth)
        .height(stage.clientHeight)
        .backgroundColor('rgba(0,0,0,0)')
        .graphData({ nodes, links })
        .nodeId('id')
        .nodeLabel(n => N(n).label.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`))
        .nodeVal(n => size(N(n)))
        .cooldownTime(4000)
        .d3VelocityDecay(0.35)
        .linkColor(l => (selected && hot.has(endId(l.source)) && hot.has(endId(l.target)) ? col.gold : col.rule))
        .linkWidth(l => (touches(l) ? 1.4 : 0.6))
        .linkDirectionalArrowLength(l => (touches(l) ? 3 : 0))
        .linkDirectionalArrowRelPos(1)
        .nodeCanvasObject((node, ctx, scale) => {
          const n = N(node)
          const r = size(n)
          const x = n.x ?? 0
          const y = n.y ?? 0
          const dim = !!selected && !hot.has(n.id)
          ctx.globalAlpha = dim ? 0.18 : 1
          ctx.beginPath()
          ctx.arc(x, y, r + 0.9, 0, 2 * Math.PI)
          ctx.fillStyle = col.panel
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x, y, r, 0, 2 * Math.PI)
          ctx.fillStyle = col[familyOf(n.group).name]
          ctx.fill()
          if (selected && !dim) {
            ctx.strokeStyle = col.gold
            if (n === selected) {
              ctx.setLineDash([1.6, 1.2])
              ctx.lineWidth = 0.9
              ctx.beginPath()
              ctx.arc(x, y, r + 3, 0, 2 * Math.PI)
              ctx.stroke()
              ctx.setLineDash([])
            } else {
              ctx.lineWidth = 0.7
              ctx.beginPath()
              ctx.arc(x, y, r + 1.6, 0, 2 * Math.PI)
              ctx.stroke()
            }
            if (n === selected || scale > 1.6) {
              ctx.font = `${11 / scale}px 'IBM Plex Mono', monospace`
              ctx.fillStyle = col.fg
              ctx.textAlign = 'center'
              ctx.fillText(n.label, x, y + r + 4 + 11 / scale)
            }
          }
          ctx.globalAlpha = 1
        })
        .nodePointerAreaPaint((node, colour, ctx) => {
          const n = N(node)
          ctx.fillStyle = colour
          ctx.beginPath()
          ctx.arc(n.x ?? 0, n.y ?? 0, size(n) + 2, 0, 2 * Math.PI)
          ctx.fill()
        })
        .onNodeClick(n => select(N(n)))
        .onBackgroundClick(() => select(null))

      // capped repulsion keeps the isolated knots from drifting off and shrinking the fit to dust
      fg.d3Force('charge')?.strength(-14).distanceMax(90)
      fg.d3Force('link')?.distance(14)
      let fitted = false
      fg.onEngineStop(() => {
        if (fitted) return
        fitted = true
        fg?.zoomToFit(500, 16)
      })
      setTimeout(() => fitted || fg?.zoomToFit(400, 16), 1500)
    } catch (e) {
      console.error('[yakuza graph]', e)
      failed = true
      status = "The graph couldn't be loaded."
    }
  }

  onMount(() => {
    const stop = whenNear(figure!, build, '200px')
    // measured on every size change, including when a hidden slide is shown
    const ro = new ResizeObserver(() => {
      if (fg && stage && stage.clientWidth) fg.width(stage.clientWidth).height(stage.clientHeight)
    })
    ro.observe(stage!)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? fg?.resumeAnimation() : fg?.pauseAnimation()))
    io.observe(stage!)
    const mo = new MutationObserver(() => {
      if (!fg) return
      readColours()
      repaint()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      fg?._destructor()
      fg = undefined
    }
  })
</script>

<figure class="explorer wide" bind:this={figure}>
  <div class="yk-bar">
    <span>{status}</span>
    <label class="yk-find">
      <span class="sr-only">Find a node</span>
      <input
        type="search"
        placeholder="find a node…"
        list="{uid}-list"
        autocomplete="off"
        disabled={!options.length}
        onchange={find} />
    </label>
    <datalist id="{uid}-list">
      {#each options as label}<option value={label}></option>{/each}
    </datalist>
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="yk-stage" bind:this={stage} onkeydown={onStageKey}>
    <div class="yk-canvas" bind:this={canvas} role="img" aria-label="Force-directed graph of the decoded Yakuza 0 tables"></div>
    <div class="yk-live" aria-live="polite">
      {#if miss}
        <p class="yk-detail yk-miss">{miss}</p>
      {:else if selected}
        {@const fam = familyOf(selected.group)}
        <aside class="yk-detail" aria-label="Selected node">
          <button class="close" type="button" aria-label="Close" onclick={() => select(null)}>×</button>
          <b>{selected.label}</b>
          <div class="grp">
            <i style="color: var({fam.token}); background: var({fam.token})"></i>
            {selected.group}
          </div>
          {#if fields.length}
            <dl>
              {#each fields as [k, v]}<dt>{k}</dt>
                <dd>{v}</dd>{/each}
            </dl>
          {/if}
          {#if linked.length}
            <div class="nb">
              Linked:
              {#each linked as m, i}{#if i}{', '}{/if}
                <button type="button" onclick={() => select(m, true)}>{m.label}</button>{/each}
              {#if linkedTotal > SHOW_LINKED}and {linkedTotal - SHOW_LINKED} more{/if}
            </div>
          {/if}
        </aside>
      {/if}
    </div>
    {#if failed}<p class="yk-hint">Try reloading the page.</p>{:else}<p class="yk-hint">
        Drag to pan · scroll to zoom · click a knot
      </p>{/if}
  </div>
  <ul class="yk-legend" aria-label="Families">
    {#each FAMILIES as f}<li>
        <i style="color: var({f.token}); background: var({f.token})"></i>
        {f.name}
      </li>{/each}
  </ul>
</figure>

<style>
  .explorer {
    margin-block: 1.8rem;
  }
  .yk-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem 1rem;
    flex-wrap: wrap;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    padding: 0 0 0.5rem;
  }
  .yk-find input {
    font: inherit;
    color: var(--fg);
    background: var(--bg);
    border: 1px solid var(--rule);
    border-radius: 99px;
    padding: 0.25rem 0.8rem;
    width: 15rem;
    max-width: 60vw;
  }
  .yk-find input:focus-visible {
    outline: 2px solid var(--r3);
    outline-offset: 1px;
  }
  .yk-stage {
    position: relative;
    height: 32rem;
    border-radius: 12px;
    overflow: hidden;
    background: var(--panel);
  }
  .yk-stage::after {
    content: '';
    position: absolute;
    inset: 6px;
    border: 1.5px dashed color-mix(in srgb, var(--g1) 55%, transparent);
    border-radius: 9px;
    pointer-events: none;
  }
  .yk-canvas {
    position: absolute;
    inset: 0;
  }
  .yk-canvas :global(.float-tooltip-kap) {
    font-family: var(--mono) !important;
    font-size: 11.5px !important;
    background: var(--bg) !important;
    color: var(--fg) !important;
    border: 1px solid var(--rule);
    border-radius: 6px !important;
    padding: 0.2rem 0.5rem !important;
  }
  .yk-detail {
    position: absolute;
    right: 0.9rem;
    top: 0.9rem;
    width: min(19rem, 70%);
    max-height: calc(100% - 1.8rem);
    overflow: auto;
    margin: 0;
    padding: 0.8rem 1rem;
    background: var(--bg);
    border: 1px solid var(--rule);
    outline: 1px dashed color-mix(in srgb, var(--g1) 60%, transparent);
    outline-offset: -5px;
    border-radius: 8px;
    z-index: 2;
    font-size: 14px;
  }
  .yk-miss {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
  }
  .yk-detail b {
    display: block;
    font-weight: 500;
    font-size: 1.05rem;
    color: var(--fg);
    line-height: 1.25;
    padding-right: 1.2rem;
  }
  .yk-detail dl {
    margin: 0;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.15rem 0.7rem;
    font-size: 12.5px;
  }
  .yk-detail dt {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }
  .yk-detail dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .nb {
    margin-top: 0.6rem;
    font-size: 13px;
  }
  .nb button {
    font: inherit;
    color: var(--link);
    background: none;
    border: 0;
    padding: 0;
    cursor: var(--pointer);
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--link) 40%, transparent);
    text-underline-offset: 2px;
  }
  .close {
    position: absolute;
    right: 0.6rem;
    top: 0.45rem;
    font-family: var(--mono);
    font-size: 14px;
    background: none;
    border: 0;
    color: var(--muted);
    cursor: var(--pointer);
  }
  .yk-hint {
    position: absolute;
    left: 1rem;
    bottom: 0.7rem;
    margin: 0;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    pointer-events: none;
  }
  .yk-legend {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 1rem;
    padding: 0.6rem 0 0;
    margin: 0;
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--muted);
  }
  .yk-legend li,
  .grp {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .grp {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    margin: 0.25rem 0 0.6rem;
  }
  .yk-legend i,
  .grp i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    box-shadow:
      0 0 0 1.5px var(--bg),
      0 0 0 2.5px currentColor;
  }
  @media (max-width: 40rem) {
    .yk-stage {
      height: 24rem;
    }
    /* a sheet along the bottom, so the knot it centres on stays visible */
    .yk-detail {
      top: auto;
      bottom: 0.6rem;
      left: 0.6rem;
      right: 0.6rem;
      width: auto;
      max-height: 45%;
    }
  }
</style>
