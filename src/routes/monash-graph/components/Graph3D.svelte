<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import type { GraphData, UnitNode } from '../types'
  
  export let graphData: GraphData
  export let onNodeClick: (node: UnitNode) => void = () => {}
  export let centerOnNode: UnitNode | null = null
  
  let container: HTMLDivElement
  let Graph: any
  
  // Watch for center requests
  $: if (Graph && centerOnNode) {
    Graph.cameraPosition(
      { x: centerOnNode.x! - 50, y: centerOnNode.y! - 50, z: centerOnNode.z! - 50 },
      centerOnNode,
      1000
    )
  }
  
  onMount(async () => {
    if (!browser) return
    
    // Dynamic import to avoid SSR issues
    const ForceGraph3D = (await import('3d-force-graph')).default
    
    Graph = ForceGraph3D()(container)
      .graphData(graphData)
      .nodeLabel((node: any) => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy((node: any) => node.id.slice(0, 3))
      .warmupTicks(100)
      .cooldownTicks(0)
      .onNodeClick((node: any) => {
        onNodeClick(node as UnitNode)
      })
  })
  
  // Update graph data when it changes
  $: if (Graph && graphData) {
    Graph.graphData(graphData)
  }
  
  onDestroy(() => {
    if (Graph) {
      Graph.graphData({ nodes: [], links: [] })
      Graph.onNodeClick(null)
      Graph = null
    }
  })
</script>

<div bind:this={container} class="w-full h-full absolute inset-0" />

