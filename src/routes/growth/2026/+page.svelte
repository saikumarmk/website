<script lang="ts">
  import growthData from '$lib/../resources/growth2026.json'
  import GrowthControls from './components/GrowthControls.svelte'
  import GrowthGraph2D from './components/GrowthGraph2D.svelte'
  import type { GrowthData, GrowthNode, GraphNode } from './types'
  import { buildGraphData, filterNodes, filterEdges, createNodeMap } from './utils/graphHelpers'
  import { computeDerivedStatuses } from './utils/nodeUtils'
  import '../../../styles/pokesprite-pokemon-gen8.css'

  const data = growthData as GrowthData

  const nodesWithStatuses = computeDerivedStatuses(data.nodes)

  let searchQuery = $state('')
  let selectedBranches = $state<string[]>([])
  let selectedTiers = $state<string[]>([])
  let selectedStatuses = $state<string[]>([])

  let selectedNode = $state<GraphNode | null>(null)

  $effect(() => {
    if (selectedNode) {
      console.log('Selected node updated in parent:', selectedNode.id, selectedNode.title)
    }
  })

  let filteredNodes = $derived(
    filterNodes(nodesWithStatuses, searchQuery, selectedBranches, selectedTiers, selectedStatuses)
  )

  let visibleNodeIds = $derived(new Set(filteredNodes.map(n => n.id)))

  let filteredEdges = $derived(filterEdges(data.edges, visibleNodeIds))

  let graphData = $derived(buildGraphData(filteredNodes, filteredEdges))

  let nodeMap = $derived(createNodeMap(nodesWithStatuses))

  $effect(() => {
    if (selectedNode && !visibleNodeIds.has(selectedNode.id)) {
      selectedNode = null
    }
  })
</script>

<svelte:head>
  <title>Yggdrasil 2026 - Skill Tree</title>
</svelte:head>

<div class="h-screen flex flex-col overflow-hidden bg-base-300">
  <div class="flex-1 flex overflow-hidden relative">
    <div class="w-80 flex-none absolute lg:relative h-full z-30 shadow-xl" style="left: 0;">
      <GrowthControls
        {data}
        bind:searchQuery
        bind:selectedBranches
        bind:selectedTiers
        bind:selectedStatuses
        bind:selectedNode
        {nodeMap}
      />
    </div>

    <div class="flex-1 overflow-hidden relative">
      <div class="w-full h-full absolute inset-0">
        <GrowthGraph2D nodes={graphData.nodes} links={graphData.links} bind:selectedNode />
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
</style>
