<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  
  // Add immediate logging
  console.log('🚀 Script loading...')
  
  // Load the generated Mermaid code
  let mermaidCode = ''
  let containerElement: HTMLDivElement | null = null
  let isLoading = true
  let error: string | null = null
  let showCode = false
  let zoomLevel = 100
  let renderAttempts = 0
  let panX = 0
  let panY = 0
  let isPanning = false
  let startX = 0
  let startY = 0
  
  console.log('📊 Initial state:', { browser, isLoading, renderAttempts })
  
  // Use action to ensure element is mounted
  function setupContainer(node: HTMLDivElement) {
    containerElement = node
    console.log('Container mounted:', !!node)
    return {
      destroy() {
        containerElement = null
      }
    }
  }
  
  async function renderDiagram() {
    if (!browser || !containerElement) {
      console.warn('Browser not ready or container missing')
      return
    }
    
    renderAttempts++
    console.log(`Render attempt ${renderAttempts}`)
    
    try {
      isLoading = true
      error = null
      
      // Load the Mermaid file
      console.log('Fetching mermaid file...')
      const response = await fetch('/mth-flowchart.mmd')
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`)
      }
      mermaidCode = await response.text()
      console.log(`Loaded ${mermaidCode.length} bytes`)
      
      // Initialize Mermaid
      console.log('Loading mermaid library...')
      const mermaid = (await import('mermaid')).default
      
      console.log('Initializing mermaid...')
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        flowchart: {
          curve: 'linear',
          padding: 5,
          nodeSpacing: 20,
          rankSpacing: 40,
          htmlLabels: true,
          diagramPadding: 5
        },
        maxTextSize: 100000,
        logLevel: 'error'
      })
      
      // Render
      console.log('Rendering diagram...')
      const { svg } = await mermaid.render('mth-flowchart-full', mermaidCode)
      console.log(`Rendered ${svg.length} bytes of SVG`)
      
      // Set innerHTML
      if (containerElement) {
        console.log('Setting container innerHTML...')
        containerElement.innerHTML = svg
        
        // Style SVG for pan/zoom
        const svgElement = containerElement.querySelector('svg')
        if (svgElement) {
          svgElement.style.width = 'auto'
          svgElement.style.height = 'auto'
          svgElement.style.maxWidth = 'none'
          svgElement.style.cursor = 'grab'
          svgElement.style.transformOrigin = '0 0'
          applyTransform()
          console.log('✅ Render complete!')
        }
      }
      
      isLoading = false
    } catch (err) {
      console.error('❌ Render error:', err)
      error = err instanceof Error ? err.message : String(err)
      isLoading = false
    }
  }
  
  // Trigger render when container is ready
  $: {
    console.log('🔄 Reactive check:', {
      browser,
      hasContainer: !!containerElement,
      hasMermaidCode: !!mermaidCode,
      renderAttempts
    })
    
    if (browser && containerElement && !mermaidCode && renderAttempts === 0) {
      console.log('✅ All conditions met, triggering render...')
      setTimeout(() => renderDiagram(), 10)
    }
  }
  
  function applyTransform() {
    if (!containerElement) return
    const svgElement = containerElement.querySelector('svg')
    if (svgElement) {
      const scale = zoomLevel / 100
      svgElement.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`
    }
  }
  
  function handleZoom(delta: number) {
    if (!containerElement) return
    const oldZoom = zoomLevel
    zoomLevel = Math.max(25, Math.min(300, zoomLevel + delta))
    
    // Adjust pan to zoom towards center
    const zoomFactor = zoomLevel / oldZoom
    const rect = containerElement.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    panX = centerX - (centerX - panX) * zoomFactor
    panY = centerY - (centerY - panY) * zoomFactor
    
    applyTransform()
  }
  
  function resetZoom() {
    if (!containerElement) return
    zoomLevel = 100
    panX = 0
    panY = 0
    applyTransform()
  }
  
  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -10 : 10
    handleZoom(delta)
  }
  
  function handleMouseDown(event: MouseEvent) {
    if (event.button !== 0) return // Only left click
    isPanning = true
    startX = event.clientX - panX
    startY = event.clientY - panY
    const svgElement = containerElement?.querySelector('svg')
    if (svgElement) svgElement.style.cursor = 'grabbing'
  }
  
  function handleMouseMove(event: MouseEvent) {
    if (!isPanning) return
    panX = event.clientX - startX
    panY = event.clientY - startY
    applyTransform()
  }
  
  function handleMouseUp() {
    isPanning = false
    const svgElement = containerElement?.querySelector('svg')
    if (svgElement) svgElement.style.cursor = 'grab'
  }
  
  function downloadSVG() {
    if (!containerElement) return
    const svgElement = containerElement.querySelector('svg')
    if (!svgElement) return
    
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mth-flowchart.svg'
    a.click()
    URL.revokeObjectURL(url)
  }
</script>

<svelte:head>
  <title>MTH Flowchart - Complete | saikumarmk.com</title>
</svelte:head>

<div class="h-screen flex flex-col overflow-hidden bg-base-200">
  <!-- Header -->
  <div class="navbar bg-base-100 shadow-lg flex-none z-50">
    <div class="flex-1 gap-2">
      <a href="/monash-graph" class="btn btn-ghost btn-sm normal-case">
        ← Back
      </a>
      <h1 class="text-xl font-bold">MTH Unit Flowchart</h1>
      <div class="badge badge-info">74 Connected Units</div>
      <div class="badge badge-ghost">Top-down flow</div>
    </div>
    
    <div class="flex-none gap-2">
      <!-- Zoom Controls -->
      <div class="join">
        <button class="btn btn-sm join-item" on:click={() => handleZoom(-25)}>
          <span class="text-lg">−</span>
        </button>
        <button class="btn btn-sm join-item" on:click={resetZoom}>
          {zoomLevel}%
        </button>
        <button class="btn btn-sm join-item" on:click={() => handleZoom(25)}>
          <span class="text-lg">+</span>
        </button>
      </div>
      
      <!-- Actions -->
      <button class="btn btn-sm btn-ghost" on:click={() => showCode = !showCode}>
        {showCode ? 'Hide' : 'Show'} Code
      </button>
      <button class="btn btn-sm" on:click={renderDiagram} disabled={isLoading}>
        {isLoading ? 'Rendering...' : 'Reload'}
      </button>
      <button class="btn btn-sm btn-primary" on:click={downloadSVG} disabled={isLoading}>
        Download SVG
      </button>
      <a href="/prototypes/mth-flowchart" class="btn btn-sm btn-secondary">
        Interactive Version
      </a>
    </div>
  </div>
  
  <!-- Code Panel (collapsible) -->
  {#if showCode && mermaidCode}
    <div class="bg-base-300 border-b border-base-content/10 max-h-64 overflow-auto flex-none">
      <div class="p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-bold text-sm">Mermaid Source Code</h3>
          <button 
            class="btn btn-xs btn-ghost"
            on:click={() => navigator.clipboard.writeText(mermaidCode)}
          >
            Copy
          </button>
        </div>
        <pre class="text-xs bg-base-100 p-4 rounded overflow-auto"><code>{mermaidCode}</code></pre>
      </div>
    </div>
  {/if}
  
  <!-- Main Content Area -->
  <div class="flex-1 overflow-hidden relative">
    <div class="h-full">
      <!-- Always render container -->
      <div 
        use:setupContainer
        on:wheel={handleWheel}
        on:mousedown={handleMouseDown}
        on:mousemove={handleMouseMove}
        on:mouseup={handleMouseUp}
        on:mouseleave={handleMouseUp}
        class="bg-white h-full w-full overflow-hidden relative cursor-grab"
        style="user-select: none;"
      >
        <!-- Loading overlay -->
        {#if isLoading}
          <div class="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
            <div class="text-center">
              <div class="loading loading-spinner loading-lg"></div>
              <p class="mt-4 text-lg">Rendering flowchart...</p>
              <p class="text-sm opacity-70">74 units with prerequisites & corequisites</p>
            </div>
          </div>
        {/if}
        
        <!-- Error overlay -->
        {#if error}
          <div class="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
            <div class="alert alert-error max-w-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-bold">Rendering Error</h3>
                <p class="text-sm">{error}</p>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Placeholder (will be replaced by SVG) -->
        {#if !isLoading && !error && !mermaidCode}
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center text-base-content/30">
              <p>Chart will appear here...</p>
              <p class="text-xs mt-2">Use mouse wheel to zoom, drag to pan</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Footer Info -->
  <div class="bg-base-100 border-t border-base-content/10 p-4 flex-none">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-4 justify-between items-center text-sm">
      <div class="flex gap-6">
        <div>
          <span class="font-semibold">Legend:</span>
          <span class="ml-2 inline-block w-4 h-4 bg-green-300 border-2 border-slate-800 rounded"></span> 1000
          <span class="ml-2 inline-block w-4 h-4 bg-yellow-300 border-2 border-slate-800 rounded"></span> 2000
          <span class="ml-2 inline-block w-4 h-4 bg-red-300 border-2 border-slate-800 rounded"></span> 3000
          <span class="ml-2 inline-block w-4 h-4 bg-fuchsia-400 border-2 border-slate-800 rounded"></span> 4000
        </div>
        <div class="opacity-70">
          <span class="font-semibold">Links:</span>
          <span class="ml-2">Solid = prerequisite</span>
          <span class="ml-2">Dashed = OR/corequisite</span>
          <span class="ml-2 font-semibold">"coreq" = take concurrently</span>
        </div>
        <div class="opacity-70">
          <span class="font-semibold">Controls:</span>
          <span class="ml-2">🖱️ Mouse wheel = zoom</span>
          <span class="ml-2">✋ Click & drag = pan</span>
        </div>
      </div>
      <div class="opacity-70">
        74 connected units • 31 isolated filtered • Auto-generated {new Date().toLocaleDateString()}
      </div>
    </div>
  </div>
</div>

<style>
  :global(#mth-flowchart-full) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
</style>

