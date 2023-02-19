<script type="module">
  // Random tree
  import ForceGraph from 'force-graph'
  import * as data from './network.json'
  let searchBoxValue

  let Graph

  function searchNode(idToFind) {
    const node = data.nodes.find(n => n.id === idToFind)
    if (node) {
      Graph.centerAt(node.x, node.y, 1000)
      Graph.zoom(1, 1000)
    } else {
      alert(`Node with id "${idToFind}" not found.`)
    }
  }

  function GraphAction(component) {
    Graph = ForceGraph()(component)
      .graphData(data)
      .nodeLabel(node => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy(node => `${node.id.slice(0, 3)}`)
      .warmupTicks(100)
      .nodeRelSize(6)
      .cooldownTicks(0)
  }
</script>

<input id="search-box" type="text" bind:value={searchBoxValue} />
<button on:click={() => searchNode(searchBoxValue)}>Search</button>
<div use:GraphAction />
