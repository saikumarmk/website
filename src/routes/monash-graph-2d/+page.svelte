<!-- YourComponent.svelte -->
<script>
  import ForceGraph from 'force-graph'
  import * as data from '../../resources/network_full.json'
  let searchBoxValue
  let Graph
  let showLeftTab = true
  let schoolTags = []
  let filteredData

  function searchNode(idToFind) {
    const node = data.nodes.find(n => n.id.toUpperCase() === idToFind)
    if (node) {
      Graph.centerAt(node.x, node.y, 1000)
      Graph.zoom(1, 1000)
      populateUnitInfo(data.general_info[idToFind])
    } else {
      alert(`Node with id "${idToFind}" not found.`)
    }
  }

  function applyFilter() {
    if (schoolTags.length === 0) {
      // If no tags are selected, show all nodes
      filteredData = data
    } else {
      // Filter nodes based on selected tags
      filteredData = {
        nodes: data.nodes.filter(node => schoolTags.includes(node.id.slice(0, 3))),
        links: data.links.filter(link => {
          const sourceInFilter = schoolTags.includes(link.source.id.slice(0, 3))
          const targetInFilter = schoolTags.includes(link.target.id.slice(0, 3))
          return sourceInFilter && targetInFilter
        })
      }
    }
    // Update the graph with the filtered data
    Graph.graphData(filteredData)
  }

  function addSchoolTag(event) {
    if (event.key === 'Enter') {
      const value = event.target.value.trim()
      if (value && !schoolTags.includes(value)) {
        schoolTags = [...schoolTags, value]
      }
      event.target.value = '' // Clear the input field
      applyFilter()
    }
  }

  function removeSchoolTag(tag) {
    schoolTags = schoolTags.filter(t => t !== tag)
    applyFilter()
  }

  function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
      searchNode(searchBoxValue)
    }
  }

  function toggleLeftTab() {
    showLeftTab = !showLeftTab
  }

  function toggleRequirements() {
    showRequirements = !showRequirements
  }

  function toggleUnlocks() {
    showUnlocks = !showUnlocks
  }

  function preprocessRequisites(requisites) {
    let formattedRequisites = ''

    // Add permission
    formattedRequisites += `<strong>Permission:</strong> ${requisites.permission}<br>`

    // Add prohibitions
    if (requisites.prohibitions.length > 0) {
      formattedRequisites += '<strong>Prohibitions:</strong><br>'
      requisites.prohibitions.forEach(prohibition => {
        formattedRequisites += `&nbsp;&nbsp;&nbsp;${prohibition}<br>`
      })
    }

    // Add corequisites
    if (requisites.corequisites.length > 0) {
      formattedRequisites += '<strong>Corequisites:</strong><br>'
      requisites.corequisites.forEach(coreq => {
        formattedRequisites += `&nbsp;&nbsp;&nbsp;${coreq.NumReq} of:`
        coreq.units.forEach(unit => {
          formattedRequisites += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${unit}`
        })
        formattedRequisites += '<br>'
      })
    }

    // Add prerequisites
    if (requisites.prerequisites.length > 0) {
      formattedRequisites += '<strong>Prerequisites:</strong><br>'
      requisites.prerequisites.forEach(prereq => {
        formattedRequisites += `&nbsp;&nbsp;&nbsp;${prereq.NumReq} of:`
        prereq.units.forEach(unit => {
          formattedRequisites += `<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${unit}`
        })
        formattedRequisites += '<br>'
      })
    }

    // Add cp_required
    formattedRequisites += `<strong>CP Required:</strong> ${requisites.cp_required}<br>`

    return formattedRequisites
  }

  const costData = {
    '4': 14630,
    '3': 11401,
    '2': 8021,
    '1': 3985
  }

  function calculateUnitCost(creditPoints, band) {
    // Get the cost from the cost data based on the band
    const costPer48CP = costData[band]

    // Calculate the total cost of the unit
    const totalCost = (Number(creditPoints) * costPer48CP) / 48

    return totalCost
  }

  function populateUnitInfo(unitData) {
    const unitInfoSection = document.getElementById('unit-info')
    unitInfoSection.innerHTML = '' // Clear existing content

    // Create title for unit name with code
    const title = `<strong ><a href="https://handbook.monash.edu/current/units/${unitData.code}" target="_blank">${unitData.code} - ${unitData.title}</a></strong><br>`

    // Create HTML elements to display unit information
    const unitInfoHTML = `
      ${title}
      CSP Cost:$${calculateUnitCost(unitData['credit_points'], unitData['sca_band'])}
      ${unitData.academic_org}<br>
      ${unitData.school === unitData.academic_org ? '' : unitData.school + '<br>'}
      <br>
      ${unitData.requisites ? preprocessRequisites(unitData.requisites) : 'No Requisites'}
    `

    // Append HTML elements to unit information section
    unitInfoSection.innerHTML = unitInfoHTML
  }

  let highlightNodes = new Set()
  const highlightLinks = new Set()
  let hoverNode = null
  let NODE_R = 8
  let showUnlocks = true
  let showRequirements = true

  const highlightNode = node => {
    let highlightUnlockNodes = new Set()
    let highlightRequireNodes = new Set()

    highlightLinks.clear()
    if (node) {
      highlightUnlockNodes.add(node)
      // need to build a map for this
      if (showUnlocks) {
        node.unlocks.forEach(neighbor => highlightUnlockNodes.add(data.nodes[data.index_map[neighbor]]))
        //node.unlock_link.forEach(link => highlightLinks.add(link))
      }
      if (showRequirements) {
        node.requires.forEach(neighbor => highlightRequireNodes.add(data.nodes[data.index_map[neighbor]]))
        //node.require_link.forEach(link => highlightLinks.add(link))
      }
    }

    hoverNode = node || null
    highlightNodes = new Set([...highlightUnlockNodes, ...highlightRequireNodes])
  }
  /* adding arrows to links slows down the graph a bit 
  
  */
  function GraphActionOriginal(component) {
    Graph = ForceGraph()(component)
      .graphData(data)
      .nodeLabel(node => `${node.id}: ${node.unit_name}`)
      .nodeAutoColorBy(node => `${node.school}`)
      .warmupTicks(100)
      .nodeRelSize(6)
      .cooldownTicks(0)
      .autoPauseRedraw(false)
      .onNodeHover(node => {
        highlightNode(node)
      })
      .nodeCanvasObjectMode(node => (highlightNodes.has(node) ? 'before' : undefined))
      .nodeCanvasObject((node, ctx) => {
        // add ring just for highlighted nodes
        ctx.beginPath()
        ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false)
        ctx.fillStyle = node === hoverNode ? 'red' : 'orange'
        ctx.fill()
      })
      .onNodeClick(node => {
        populateUnitInfo(data.general_info[node.id])
      })
  }
</script>

<div class="container">
  <span class="toggle-button" on:click={toggleLeftTab}>
    <span class={showLeftTab ? 'i-heroicons-solid-chevron-double-left' : 'i-heroicons-solid-chevron-double-right'}></span>
  </span>

  <div class="column {showLeftTab ? '' : 'left-tab-hidden'} left-tab">
    {#if showLeftTab}
      <div class="left-tab-content">
        <div class="left-tab-title">Search for a unit</div>
        <div class="left-tab-item">
          <input
            id="search-box"
            type="text"
            bind:value={searchBoxValue}
            on:keypress={handleSearchKeyPress}
            placeholder="Unit Code"
            class="input input-ghost input-bordered xl:bg-base-100 xl:text-base-content transition-all w-full h-8" />
        </div>

        <div class="left-tab-title">Filter by School</div>
        <div class="left-tab-item">
          <label for="school-input"></label>
          <input
            id="school-input"
            type="text"
            placeholder="School"
            on:keypress={addSchoolTag}
            class="input input-ghost input-bordered xl:bg-base-100 xl:text-base-content transition-all w-full h-8" />

          <!-- Display school tags -->
          <div>
            {#each schoolTags as tag}
              <span class="tag">
                {tag}
                <button on:click={() => removeSchoolTag(tag)}>☒</button>
              </span>
            {/each}
          </div>
        </div>
        <div class="left-tab-item">
          <!-- Toggle button for showing/hiding requirements -->
          <button on:click={toggleRequirements} class="btn btn-sm btn-ghost normal-case gap-2">
            {#if showRequirements}
              Requirements Shown
            {:else}
              Requirements Hidden
            {/if}
          </button>

          <!-- Toggle button for showing/hiding unlocks -->
          <button on:click={toggleUnlocks} class="btn btn-sm btn-ghost normal-case gap-2">
            {#if showUnlocks}
              Unlocks Shown
            {:else}
              Unlocks Hidden
            {/if}
          </button>
        </div>

        <div class="left-tab-title">Unit Information</div>
        <div id="unit-info">
          <!-- Unit information will be populated here -->
        </div>
      </div>
    {/if}
  </div>

  <div class="graph-column">
    <div id="graph-container" use:GraphActionOriginal />
  </div>
</div>

<style>
  .toggle-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 40px;
    border: 2px;
  }

  #button {
    border: 2px;
  }

  /* Style the buttons when hovered over */
  .toggle-button:hover {
    @apply bg-blue-700;
  }

  .toggle-icon {
    font-size: 24px;
  }

  .left-tab-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    white-space: nowrap;
  }

  .left-tab-item {
    margin-bottom: 10px;
  }

  .left-tab-hidden {
    display: none;
  }

  .container {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }

  .column {
    flex: 1;
    padding: 10px;
    width: 30vh;
  }

  .column.left-tab {
    width: 100%;
    /*border-right: 2px solid;*/
  }

  .graph-column {
    flex: 3;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #graph-container {
    width: 100%;
    height: 100%;
  }
</style>
