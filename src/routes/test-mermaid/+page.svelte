<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { browser } from '$app/environment'
  
  let container: HTMLDivElement
  let status = 'Initializing...'
  
  const simpleMermaid = `graph LR
    A[MTH1030] --> B[MTH2010]
    A --> C[MTH2021]
    B --> D[MTH3011]
    C --> D
    
    classDef green fill:#86efac,stroke:#1e293b,stroke-width:2px
    class A green
`
  
  async function renderMermaid() {
    try {
      status = 'Loading Mermaid library...'
      await tick()
      
      const mermaid = (await import('mermaid')).default
      
      status = 'Initializing Mermaid...'
      await tick()
      
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        logLevel: 'debug'
      })
      
      status = 'Checking container...'
      await tick()
      
      console.log('Container exists?', !!container)
      console.log('Container element:', container)
      
      if (!container) {
        status = 'ERROR: Container not found!'
        return
      }
      
      status = 'Rendering diagram...'
      await tick()
      
      const { svg } = await mermaid.render('test-diagram', simpleMermaid)
      
      status = 'Setting innerHTML...'
      await tick()
      
      container.innerHTML = svg
      
      status = '✅ Success!'
      
    } catch (error) {
      console.error('Mermaid error:', error)
      status = `❌ Error: ${error}`
    }
  }
  
  onMount(async () => {
    if (!browser) return
    
    status = 'Waiting for DOM...'
    
    // Try multiple strategies
    await tick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    await renderMermaid()
  })
</script>

<div class="min-h-screen bg-base-200 p-8">
  <div class="max-w-4xl mx-auto space-y-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Mermaid Test Page</h2>
        
        <div class="alert alert-info">
          <span class="font-mono text-sm">{status}</span>
        </div>
        
        <button class="btn btn-primary btn-sm" on:click={renderMermaid}>
          Retry Render
        </button>
        
        <div class="divider">Diagram Output</div>
        
        <div 
          bind:this={container}
          class="border-2 border-dashed border-base-300 p-4 min-h-[200px] bg-white rounded"
        >
          <p class="text-center text-base-content/50">Diagram will appear here...</p>
        </div>
        
        <div class="divider">Source Code</div>
        
        <pre class="bg-base-300 p-4 rounded text-xs overflow-auto">{simpleMermaid}</pre>
      </div>
    </div>
  </div>
</div>


