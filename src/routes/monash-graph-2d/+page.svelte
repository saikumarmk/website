<script type="module">
  // Random tree
  import ForceGraph from 'force-graph'
  import * as data from './network.json'
  import { onMount } from 'svelte'

  let Graph

  function GraphAction(component) {
    ForceGraph()(component)
      .graphData(data)
      .nodeLabel(node => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy(node => `${node.id.slice(0, 3)}`)
      .warmupTicks(100)
      .nodeRelSize(6)
      .cooldownTicks(0)
  }
</script>

<div use:GraphAction />
