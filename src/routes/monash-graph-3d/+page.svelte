<script type="module">
  // Random tree
  import ForceGraph3D from '3d-force-graph'
  import * as data from '../../resources/network2024.json'
  let searchBoxValue
  let Graph

  function searchNode(idToFind) {
    const node = data.nodes.find(n => n.id === idToFind)
    if (node) {
      Graph.cameraPosition({ x: node.x - 50, y: node.y - 50, z: node.z - 50 }, node, 1000)
    } else {
      alert(`Node with id "${idToFind}" not found.`)
    }
  }

  function GraphAction(component) {
    Graph = ForceGraph3D()(component)
      .graphData(data)
      .nodeLabel(node => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy(node => `${node.id.slice(0, 3)}`)
      .warmupTicks(100)
      .cooldownTicks(0)
  }
</script>

<input id="search-box" type="text" bind:value={searchBoxValue} />
<button on:click={() => searchNode(searchBoxValue)}>Search</button>
<div use:GraphAction />
