<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import graphData from '$lib/../resources/yakuza0-archaeology-graph.json'

  type GraphNode = {
    id: string
    label: string
    group: string
    [key: string]: unknown
  }

  type GraphLink = {
    source: string
    target: string
    type?: string
    weight?: number
  }

  const GROUP_COLORS: Record<string, string> = {
    MoneyIslandProperty: '#60a5fa',
    MoneyIslandArea: '#3b82f6',
    MoneyIslandStaff: '#93c5fd',
    PropertyRank: '#1d4ed8',
    Item: '#34d399',
    DropPool: '#10b981',
    EncounterSet: '#f472b6',
    EnemyModel: '#ec4899',
    EncounterSpawn: '#db2777',
    EncounterPopup: '#fda4af',
    NawabariTenant: '#f59e0b',
    NawabariArea: '#d97706',
    NawabariShopType: '#fbbf24',
    EndlessArenaFighter: '#ef4444',
    System: '#9ca3af',
    Evidence: '#fbbf24',
    default: '#a78bfa'
  }

  let container: HTMLDivElement
  let graphInstance: { _destructor: () => void } | null = null
  let selected = $state<GraphNode | null>(null)
  let stats = $state<Record<string, number>>({})
  let error = $state<string | null>(null)

  onMount(() => {
    if (!browser) return

    let cancelled = false

    ;(async () => {
      try {
        const nodes: GraphNode[] = graphData.nodes ?? []
        const links: GraphLink[] = (graphData.links ?? []).map((link: GraphLink) => ({
          ...link,
          source: typeof link.source === 'object' ? (link.source as GraphNode).id : link.source,
          target: typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
        }))
        stats = graphData.stats ?? {}

        const ForceGraph = (await import('force-graph')).default
        if (cancelled) return

        const bg =
          getComputedStyle(document.documentElement).getPropertyValue('--b3').trim() || '#1a1a1a'

        const fg = ForceGraph()(container)
          .width(container.clientWidth)
          .height(container.clientHeight)
          .backgroundColor(bg)
          .graphData({ nodes, links })
          .nodeId('id')
          .nodeLabel((n: GraphNode) => `${n.label} (${n.group})`)
          .nodeColor((n: GraphNode) => GROUP_COLORS[n.group] ?? GROUP_COLORS.default)
          .nodeVal((n: GraphNode) => (n.group === 'System' ? 2 : n.group === 'Item' ? 4 : 6))
          .linkLabel((l: GraphLink) => {
            const parts = [l.type, l.weight != null ? `${l.weight}%` : null].filter(Boolean)
            return parts.join(' ')
          })
          .linkDirectionalArrowLength(4)
          .linkDirectionalArrowRelPos(1)
          .onNodeClick((n: GraphNode) => {
            selected = n
          })
          .onBackgroundClick(() => {
            selected = null
          })

        graphInstance = fg
        setTimeout(() => fg.zoomToFit(500, 40), 400)
      } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load graph'
      }
    })()

    return () => {
      cancelled = true
      graphInstance?._destructor()
      graphInstance = null
    }
  })
</script>

<div class="flex h-full flex-col">
  {#if error}
    <p class="p-4 text-sm text-error">Could not load archaeology graph: {error}</p>
  {/if}
  <div class="flex flex-wrap gap-3 border-b border-base-300 px-3 py-2 text-xs opacity-80">
    {#if stats.link_count}
      <span>{stats.link_count} edges</span>
      <span>{stats.entity_count ?? 0} entities</span>
      <span>{stats.system_count ?? 0} systems</span>
      <span>{stats.item_count ?? 0} items</span>
    {/if}
    <span class="ml-auto">Drag · scroll zoom · click node</span>
  </div>
  <div class="relative min-h-0 flex-1">
    <div bind:this={container} class="absolute inset-0"></div>
    {#if selected}
      <aside
        class="absolute right-2 top-2 z-10 max-w-xs rounded-md border border-base-300 bg-base-100/95 p-3 text-sm shadow-lg backdrop-blur"
      >
        <div class="font-semibold">{selected.label}</div>
        <div class="opacity-70">{selected.group}</div>
        <pre class="mt-2 max-h-40 overflow-auto text-xs opacity-80">{JSON.stringify(
            selected,
            null,
            2
          )}</pre>
      </aside>
    {/if}
  </div>
</div>
