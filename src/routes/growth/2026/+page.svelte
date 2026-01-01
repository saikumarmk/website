<script lang="ts">
  import growthData from '$lib/../resources/growth2026.json';
  import GrowthControls from './components/GrowthControls.svelte';
  import GrowthGraph2D from './components/GrowthGraph2D.svelte';
  import type { GrowthData, GrowthNode, GraphNode } from './types';
  import { buildGraphData, filterNodes, filterEdges, createNodeMap } from './utils/graphHelpers';
  import { computeDerivedStatuses } from './utils/nodeUtils';
  import '../../../styles/pokesprite-pokemon-gen8.css'; // Load Pokemon sprites for branch badges

  const data = growthData as GrowthData;

  // Compute derived statuses
  const nodesWithStatuses = computeDerivedStatuses(data.nodes);

  // Filter state
  let searchQuery = '';
  let selectedBranches: string[] = [];
  let selectedTiers: string[] = [];
  let selectedStatuses: string[] = [];

  // Selected node
  let selectedNode: GraphNode | null = null;

  // Debug: Log when selected node changes
  $: if (selectedNode) {
    console.log('Selected node updated in parent:', selectedNode.id, selectedNode.title);
  }

  // Reactive filtered data
  $: filteredNodes = filterNodes(
    nodesWithStatuses,
    searchQuery,
    selectedBranches,
    selectedTiers,
    selectedStatuses
  );

  $: visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  $: filteredEdges = filterEdges(data.edges, visibleNodeIds);

  $: graphData = buildGraphData(filteredNodes, filteredEdges);

  $: nodeMap = createNodeMap(nodesWithStatuses);

  // Ensure selected node is still visible
  $: if (selectedNode && !visibleNodeIds.has(selectedNode.id)) {
    selectedNode = null;
  }
</script>

<svelte:head>
  <title>Yggdrasil 2026 - Skill Tree</title>
</svelte:head>

<div class="h-screen flex flex-col overflow-hidden bg-base-300">
  <!-- Main content area -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- Left Panel: Controls + Node Info -->
    <div
      class="w-80 flex-none absolute lg:relative h-full z-30 shadow-xl"
      style="left: 0;"
    >
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

    <!-- Center: Graph Canvas -->
    <div class="flex-1 overflow-hidden relative">
      <div class="w-full h-full absolute inset-0">
        <GrowthGraph2D
          nodes={graphData.nodes}
          links={graphData.links}
          bind:selectedNode
        />
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
</style>



