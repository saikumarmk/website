<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  
  let mermaidCode = `%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#86efac', 'primaryTextColor':'#000', 'primaryBorderColor':'#1e293b', 'lineColor':'#64748b', 'secondaryColor':'#fde047', 'tertiaryColor':'#fca5a5'}}}%%
graph LR
    %% 1000 Level - Foundation
    MTH1020["MTH1020<br/>Analysis of Change"]:::level1
    MTH1030["MTH1030<br/>Techniques for Modelling"]:::level1
    
    %% 2000 Level - Intermediate
    MTH2010["MTH2010<br/>Multivariable Calculus"]:::level2
    MTH2021["MTH2021<br/>Linear Algebra"]:::level2
    MTH2032["MTH2032<br/>Differential Equations"]:::level2
    MTH2137["MTH2137<br/>Cryptography"]:::level2
    MTH2140["MTH2140<br/>Real Analysis"]:::level2
    
    %% 3000 Level - Advanced
    MTH3011["MTH3011<br/>Partial Diff Equations"]:::level3
    MTH3051["MTH3051<br/>Intro to Comp Math"]:::level3
    MTH3110["MTH3110<br/>Differential Geometry"]:::level3
    MTH3130["MTH3130<br/>Abstract Algebra"]:::level3
    MTH3141["MTH3141<br/>Group Theory"]:::level3
    MTH3160["MTH3160<br/>Analysis"]:::level3
    
    %% Prerequisite Links
    MTH1020 -.-> MTH1030
    MTH1030 --> MTH2010
    MTH1030 --> MTH2021
    MTH1030 --> MTH2032
    MTH1030 --> MTH2140
    
    MTH2010 --> MTH3011
    MTH2010 --> MTH3051
    MTH2010 --> MTH3110
    
    MTH2021 --> MTH2137
    MTH2021 --> MTH3130
    MTH2021 --> MTH3141
    
    MTH2032 --> MTH3011
    MTH2032 --> MTH3051
    
    MTH2140 --> MTH3160
    
    %% Mutual Prerequisites (shown one direction only)
    MTH2137 -.->|"OR"| MTH3141
    MTH3141 -.->|"OR"| MTH2137
    
    MTH3141 --> MTH3130
    
    %% Styling
    classDef level1 fill:#86efac,stroke:#1e293b,stroke-width:2px,color:#000
    classDef level2 fill:#fde047,stroke:#1e293b,stroke-width:2px,color:#000
    classDef level3 fill:#fca5a5,stroke:#1e293b,stroke-width:2px,color:#000
    classDef level4 fill:#e879f9,stroke:#1e293b,stroke-width:2px,color:#000
`
  
  let container: HTMLDivElement
  let showCode = false
  
  onMount(async () => {
    if (!browser) return
    
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'base',
      flowchart: {
        curve: 'basis',
        padding: 20,
        nodeSpacing: 100,
        rankSpacing: 100
      }
    })
    
    try {
      const { svg } = await mermaid.render('mermaid-flowchart', mermaidCode)
      container.innerHTML = svg
    } catch (error) {
      console.error('Mermaid rendering error:', error)
      container.innerHTML = `<div class="alert alert-error">
        <p>Error rendering diagram: ${error}</p>
      </div>`
    }
  })
</script>

<svelte:head>
  <title>MTH Flowchart (Mermaid) | saikumarmk.com</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex flex-col">
  <!-- Header -->
  <div class="navbar bg-base-100 shadow-lg flex-none">
    <div class="flex-1">
      <a href="/monash-graph" class="btn btn-ghost normal-case text-xl">
        ← MTH Flowchart (Mermaid Version)
      </a>
    </div>
    <div class="flex-none gap-2">
      <button 
        class="btn btn-sm btn-ghost"
        on:click={() => showCode = !showCode}
      >
        {showCode ? 'Hide' : 'Show'} Code
      </button>
      <a href="/prototypes/mth-flowchart" class="btn btn-sm btn-primary">
        Interactive Version
      </a>
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="flex-1 overflow-auto p-4">
    <div class="max-w-7xl mx-auto space-y-4">
      
      {#if showCode}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Mermaid Code</h2>
            <textarea 
              class="textarea textarea-bordered font-mono text-xs h-96"
              bind:value={mermaidCode}
              readonly
            ></textarea>
            <div class="card-actions justify-end">
              <button 
                class="btn btn-sm btn-primary"
                on:click={() => navigator.clipboard.writeText(mermaidCode)}
              >
                Copy Code
              </button>
            </div>
          </div>
        </div>
      {/if}
      
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div bind:this={container} class="overflow-auto"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card bg-base-300">
          <div class="card-body">
            <h2 class="card-title text-sm">Mermaid Advantages</h2>
            <ul class="text-xs space-y-1 list-disc list-inside">
              <li>✅ Text-based, easy to edit and version control</li>
              <li>✅ No cycle issues - you control the layout</li>
              <li>✅ Can manually position nodes with subgraphs</li>
              <li>✅ Works in markdown files</li>
              <li>✅ Export as SVG or PNG</li>
              <li>✅ Consistent rendering</li>
            </ul>
          </div>
        </div>
        
        <div class="card bg-base-300">
          <div class="card-body">
            <h2 class="card-title text-sm">Mermaid Limitations</h2>
            <ul class="text-xs space-y-1 list-disc list-inside">
              <li>❌ No interactive pan/zoom (static)</li>
              <li>❌ Manual node placement (no auto-layout)</li>
              <li>❌ Can't click nodes for details</li>
              <li>❌ Must manually write all connections</li>
              <li>❌ Limited styling options</li>
              <li>❌ Doesn't auto-generate from data</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-sm">
          <p class="font-bold">Best Use Case:</p>
          <p>Mermaid is perfect for <strong>curated, hand-crafted flowcharts</strong> in documentation or blog posts. 
          For <strong>interactive exploration</strong> of all 105 MTH units, the force-graph version is better.</p>
        </div>
      </div>
    </div>
  </div>
</div>


