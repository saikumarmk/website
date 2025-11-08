<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import type { GraphData, UnitNode, UnitGeneralInfo } from '../types'
  import { getHighlightedNodes } from '../utils/graphHelpers'
  
  export let graphData: GraphData
  export let showUnlocks: boolean
  export let showRequirements: boolean
  export let isDAGMode: boolean = false
  export let onNodeClick: (node: UnitNode) => void = () => {}
  export let centerOnNode: UnitNode | null = null
  
  let container: HTMLDivElement
  let Graph: any
  let highlightNodes = new Set<UnitNode>()
  let hoverNode: UnitNode | null = null
  
  const NODE_R = 8
  
  function setupGraph() {
    if (!Graph) return
    
    if (isDAGMode) {
      // DAG mode for unit code filtering (build mode)
      Graph
        .dagMode('lr')
        .dagLevelDistance(300)
        .cooldownTicks(Infinity)
        .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D) => {
          // Show node labels in DAG mode
          const label = node.id
          const fontSize = 16
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
          )
          
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = 'black'
          ctx.fillText(label, node.x, node.y)
        })
        .nodeCanvasObjectMode(() => 'replace')
        .linkCurvature((d: any) => {
          return 0.07 * Math.max(-1, Math.min(1, (d.target.y - d.source.y) / 25))
        })
    } else {
      // Normal force-directed mode
      Graph
        .dagMode(null)
        .cooldownTicks(0)
        .nodeCanvasObjectMode((node: any) => (highlightNodes.has(node) ? 'before' : undefined))
        .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D) => {
          // Add ring for highlighted nodes
          ctx.beginPath()
          ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false)
          ctx.fillStyle = node === hoverNode ? 'red' : 'orange'
          ctx.fill()
        })
        .linkCurvature(0)
    }
  }
  
  function highlightNode(node: UnitNode | null) {
    highlightNodes = getHighlightedNodes(node, graphData, showUnlocks, showRequirements)
    hoverNode = node
  }
  
  // Watch for center requests
  $: if (Graph && centerOnNode) {
    Graph.centerAt(centerOnNode.x, centerOnNode.y, 1000)
    Graph.zoom(1, 1000)
    highlightNode(centerOnNode)
  }
  
  onMount(async () => {
    if (!browser) return
    
    // Dynamic import to avoid SSR issues
    const ForceGraph = (await import('force-graph')).default
    
    Graph = ForceGraph()(container)
      .graphData(graphData)
      .nodeLabel((node: any) => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy((node: any) => node.school)
      .warmupTicks(100)
      .nodeRelSize(6)
      .autoPauseRedraw(false)
      .onNodeHover((node: any) => {
        highlightNode(node)
      })
      .onNodeClick((node: any) => {
        onNodeClick(node as UnitNode)
      })
    
    // Set up initial graph mode
    setupGraph()
  })
  
  // Update graph data when it changes
  $: if (Graph && graphData) {
    Graph.graphData(graphData)
  }
  
  // Update graph mode when isDAGMode changes
  $: if (Graph && isDAGMode !== undefined) {
    setupGraph()
  }
  
  onDestroy(() => {
    if (Graph) {
      // Cleanup
      Graph.graphData({ nodes: [], links: [] })
      Graph.onNodeHover(null)
      Graph.onNodeClick(null)
      Graph.nodeCanvasObject(() => {})
      Graph.nodeCanvasObjectMode(() => {})
      Graph = null
    }
  })
</script>

<div bind:this={container} class="w-full h-full absolute inset-0" />

