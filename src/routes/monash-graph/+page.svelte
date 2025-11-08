<script lang="ts">
  import { browser } from '$app/environment'
  import type { ViewMode, UnitNode, GraphData } from './types'
  import { filterGraphData, findNodeById } from './utils/graphHelpers'
  import GraphControls from './components/GraphControls.svelte'
  import UnitInfo from './components/UnitInfo.svelte'
  import Graph2D from './components/Graph2D.svelte'
  import Graph3D from './components/Graph3D.svelte'
  import Toast from './components/Toast.svelte'
  import * as rawData from '../../resources/network2024.json'
  
  const graphData = rawData as unknown as GraphData
  
  // State
  let viewMode: ViewMode = '2d'
  let showControls = true
  let showInfo = false
  
  // Filter state
  let searchQuery = ''
  let schoolTags: string[] = []
  let unitCodes: string[] = []
  let showUnlocks = true
  let showRequirements = true
  
  // Toast state
  let toastMessage = ''
  let toastType: 'success' | 'error' | 'info' = 'info'
  let showToast = false
  
  // Check if we're in "build mode" (dag mode)
  $: isDAGMode = unitCodes.length > 0
  
  // Selected node
  let selectedNode: UnitNode | null = null
  let centerOnNode: UnitNode | null = null
  
  // Filtered data
  $: filteredData = filterGraphData(graphData, schoolTags, unitCodes)
  
  function showToastMessage(message: string, type: 'success' | 'error' | 'info') {
    toastMessage = message
    toastType = type
    showToast = true
  }
  
  function handleSearch(query: string) {
    const node = findNodeById(graphData, query)
    if (node) {
      centerOnNode = node
      selectedNode = node
      showInfo = true
      showToastMessage(`Found unit: ${node.id}`, 'success')
    } else {
      showToastMessage(`Unit "${query}" not found`, 'error')
    }
  }
  
  function handleNodeClick(node: UnitNode) {
    selectedNode = node
    showInfo = true
  }
  
  function clearUnits() {
    unitCodes = []
  }
</script>

<svelte:head>
  <title>Monash Unit Graph | saikumarmk.com</title>
</svelte:head>

<div class="h-screen flex flex-col overflow-hidden">
  <!-- Header -->
  <div class="navbar bg-base-200 shadow-lg z-50 flex-none">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost normal-case text-xl">
        <span class="i-heroicons-outline-arrow-left w-5 h-5 mr-2"></span>
        Monash Unit Graph
      </a>
    </div>
    
    <!-- View Mode Toggle -->
    <div class="flex-none gap-2">
      <div class="join">
        <button
          on:click={() => viewMode = '2d'}
          class="btn btn-sm join-item"
          class:btn-primary={viewMode === '2d'}
          class:btn-ghost={viewMode !== '2d'}>
          <span class="i-heroicons-outline-rectangle-group w-4 h-4"></span>
          2D
        </button>
        <button
          on:click={() => viewMode = '3d'}
          class="btn btn-sm join-item"
          class:btn-primary={viewMode === '3d'}
          class:btn-ghost={viewMode !== '3d'}>
          <span class="i-heroicons-outline-cube w-4 h-4"></span>
          3D
        </button>
      </div>
      
      <!-- Toggle Info Button -->
      <button
        on:click={() => showInfo = !showInfo}
        class="btn btn-sm btn-circle"
        class:btn-primary={showInfo}
        class:btn-ghost={!showInfo}>
        <span class="i-heroicons-outline-information-circle w-5 h-5"></span>
      </button>
      
      <!-- Toggle Controls (Mobile) -->
      <button
        on:click={() => showControls = !showControls}
        class="btn btn-sm btn-ghost lg:hidden">
        <span class="i-heroicons-outline-adjustments-horizontal w-5 h-5"></span>
      </button>
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- Left Sidebar - Controls (Fixed) -->
    <div
      class="w-80 bg-base-100 border-r border-base-content/10 overflow-hidden flex-none z-30 absolute lg:relative h-full"
      class:hidden={!showControls}
      class:lg:flex={true}>
      <GraphControls
        bind:searchQuery
        bind:schoolTags
        bind:unitCodes
        bind:showUnlocks
        bind:showRequirements
        onSearch={handleSearch}
        onClearUnits={clearUnits}
      />
    </div>
    
    <!-- Center - Graph (Takes remaining space) -->
    <div class="flex-1 relative overflow-hidden">
      {#if viewMode === '2d'}
        <Graph2D
          graphData={filteredData}
          {showUnlocks}
          {showRequirements}
          {isDAGMode}
          onNodeClick={handleNodeClick}
          {centerOnNode}
        />
      {:else}
        <Graph3D
          graphData={filteredData}
          onNodeClick={handleNodeClick}
          {centerOnNode}
        />
      {/if}
    </div>
    
    <!-- Right Sidebar - Unit Info (Fixed) -->
    {#if showInfo}
      <div class="w-80 bg-base-100 border-l border-base-content/10 overflow-hidden flex-none z-30 absolute lg:relative right-0 h-full">
        <div class="p-4 h-full overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold">Unit Information</h2>
            <button
              on:click={() => showInfo = false}
              class="btn btn-sm btn-ghost btn-circle lg:hidden">
              <span class="i-heroicons-outline-x-mark w-5 h-5"></span>
            </button>
          </div>
          <UnitInfo node={selectedNode} {graphData} />
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Toast Notifications -->
{#if showToast}
  <Toast 
    message={toastMessage} 
    type={toastType}
    onClose={() => showToast = false}
  />
{/if}

