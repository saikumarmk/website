<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import * as rawData from '../../../resources/network2024.json'
  
  interface Requisite {
    NumReq: number
    units: string[]
  }
  
  interface UnitRequisites {
    permission: boolean
    prohibitions: string[]
    corequisites: Requisite[]
    prerequisites: Requisite[]
    cp_required: number
  }
  
  interface UnitGeneralInfo {
    code: string
    title: string
    credit_points: string
    school: string
    level: number
    requisites?: UnitRequisites
  }
  
  interface GraphNode {
    id: string
    unit_name: string
    school: string
    requires: string[]
    unlocks: string[]
  }
  
  interface FlowNode {
    id: string
    title: string
    level: number
    prerequisites: Requisite[]
    color: string
  }
  
  interface FlowLink {
    source: string
    target: string
    isToGate?: boolean
    isFromGate?: boolean
  }
  
  interface LogicGate extends FlowNode {
    isGate: true
    gateType: 'AND' | 'OR'
  }
  
  let Graph: any = null
  let graphContainer: HTMLDivElement
  let graphInstance: any = null
  
  let graphNodes: GraphNode[] = []
  let generalInfo: { [key: string]: UnitGeneralInfo } = {}
  let graphData: { nodes: (FlowNode | LogicGate)[]; links: FlowLink[] } = { nodes: [], links: [] }
  let selectedUnit: FlowNode | null = null
  let useDagMode = true // Enable DAG mode (we'll break cycles)
  let mutualPrereqs: string[] = []
  
  const COLORS = {
    1000: '#86efac', // green-300 - Foundational
    2000: '#fde047', // yellow-300 - Intermediate  
    3000: '#fca5a5', // red-300 - Advanced
    4000: '#e879f9', // fuchsia-400 - Honours
    gate: '#94a3b8' // slate-400 - Logic gates
  }
  
  // Load data at module level (build time)
  const data = rawData as any
  graphNodes = data.nodes || []
  generalInfo = data.general_info || {}
  
  onMount(async () => {
    if (!browser) return
    
    // Load ForceGraph2D dynamically
    const ForceGraph2D = (await import('force-graph')).default
    Graph = ForceGraph2D
    
    // Build graph
    buildGraph()
    
    // Initialize graph
    if (graphContainer && graphData.nodes.length > 0) {
      graphInstance = Graph()(graphContainer)
        .graphData(graphData)
        .nodeLabel((node: any) => {
          if (!node) return ''
          if (node.isGate) {
            return `<div style="background: #475569; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 13px;">
              ${node.gateType || 'Logic'} gate
            </div>`
          }
          return `<div style="background: #1e293b; color: white; padding: 10px; border-radius: 6px; max-width: 250px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${node.id || 'Unknown'}</div>
            <div style="font-size: 11px; opacity: 0.9; line-height: 1.3;">${node.title || ''}</div>
          </div>`
        })
        .nodeCanvasObject((node: any, ctx, globalScale) => {
          if (!node || !ctx || typeof node.x !== 'number' || typeof node.y !== 'number') return
          
          if (node.isGate) {
            // Draw smaller circle for logic gate
            const radius = 15
            ctx.beginPath()
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI)
            ctx.fillStyle = node.color || COLORS.gate
            ctx.fill()
            ctx.strokeStyle = '#1e293b'
            ctx.lineWidth = 2
            ctx.stroke()
            
            // Draw gate type text
            ctx.font = `bold 10px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#fff'
            ctx.fillText(node.gateType || '?', node.x, node.y)
          } else {
            // Fixed box dimensions - smaller
            const boxWidth = 80
            const boxHeight = 40
            const x = node.x - boxWidth / 2
            const y = node.y - boxHeight / 2
            
            // Draw rectangle for unit with rounded corners
            ctx.fillStyle = node.color || COLORS[1000]
            ctx.strokeStyle = '#1e293b'
            ctx.lineWidth = 2.5
            
            // Rounded rectangle
            const radius = 4
            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + boxWidth - radius, y)
            ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius)
            ctx.lineTo(x + boxWidth, y + boxHeight - radius)
            ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - radius, y + boxHeight)
            ctx.lineTo(x + radius, y + boxHeight)
            ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
            
            // Unit code (bold)
            const label = node.id || ''
            ctx.font = `bold 11px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#000'
            ctx.fillText(label, node.x, node.y - 6)
            
            // Level indicator (smaller)
            if (node.level) {
              ctx.font = `9px Sans-Serif`
              ctx.fillStyle = '#334155'
              ctx.fillText(`Lvl ${node.level / 1000}`, node.x, node.y + 8)
            }
          }
        })
        .nodePointerAreaPaint((node: any, color, ctx) => {
          if (!node || !ctx || typeof node.x !== 'number' || typeof node.y !== 'number') return
          
          if (node.isGate) {
            ctx.beginPath()
            ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI)
            ctx.fillStyle = color
            ctx.fill()
          } else {
            const boxWidth = 80
            const boxHeight = 40
            ctx.fillStyle = color
            ctx.fillRect(
              node.x - boxWidth / 2,
              node.y - boxHeight / 2,
              boxWidth,
              boxHeight
            )
          }
        })
        .linkDirectionalArrowLength(6)
        .linkDirectionalArrowRelPos(1)
        .linkColor(() => '#64748b')
        .linkWidth(2)
        .cooldownTicks(100)
        .onEngineStop(() => {
          if (graphInstance) {
            graphInstance.zoomToFit(400, 50)
          }
        })
        .onNodeClick((node: any) => {
          if (node && !node.isGate) {
            selectedUnit = node
          }
        })
      
      // Apply layout mode
      updateGraphMode()
    } else {
      console.warn('Graph container not found or no data to display')
    }
  })
  
  function updateGraphMode() {
    if (!graphInstance) return
    
    if (useDagMode) {
      graphInstance
        .dagMode('lr')
        .dagLevelDistance(200)
        .cooldownTicks(0)
        .d3Force('charge', null) // Disable charge force in DAG mode
    } else {
      graphInstance
        .dagMode(null)
        .cooldownTicks(100)
    }
  }
  
  // Watch for mode changes
  $: if (graphInstance && useDagMode !== undefined) {
    updateGraphMode()
  }
  
  function buildGraph() {
    // Filter to MTH units only
    const mthNodes = graphNodes.filter(n => n.id.startsWith('MTH'))
    
    const nodes: (FlowNode | LogicGate)[] = []
    const links: FlowLink[] = []
    let gateId = 0
    
    // Create nodes - Build a Set of valid node IDs for quick lookup
    const validNodeIds = new Set<string>()
    
    mthNodes.forEach(node => {
      const level = parseInt(node.id.substring(3, 4)) * 1000
      const info = generalInfo[node.id]
      
      validNodeIds.add(node.id)
      
      nodes.push({
        id: node.id,
        title: node.unit_name,
        level: level,
        prerequisites: info?.requisites?.prerequisites || [],
        color: COLORS[level] || COLORS[1000]
      })
    })
    
    // Detect mutual prerequisites BEFORE creating gates
    const mutualPairs: string[] = []
    const skipPrereqs = new Set<string>() // Track prereqs to skip
    
    nodes.forEach(nodeA => {
      if ('isGate' in nodeA) return
      nodeA.prerequisites.forEach(prereqA => {
        prereqA.units.filter(code => validNodeIds.has(code)).forEach(prereqCode => {
          // Check if prereqCode also has nodeA as a prerequisite
          const prereqNode = nodes.find(n => n.id === prereqCode)
          if (prereqNode && !('isGate' in prereqNode)) {
            prereqNode.prerequisites.forEach(prereqB => {
              if (prereqB.units.includes(nodeA.id)) {
                // Found mutual prereq: nodeA <-> prereqCode
                const pairKey = [nodeA.id, prereqCode].sort().join('⟷')
                if (!skipPrereqs.has(pairKey)) {
                  mutualPairs.push(`${nodeA.id} ⟷ ${prereqCode}`)
                  skipPrereqs.add(pairKey)
                  // Skip the "reverse" direction (keep nodeA -> prereqCode, skip prereqCode -> nodeA)
                  skipPrereqs.add(`${prereqCode}->${nodeA.id}`)
                }
              }
            })
          }
        })
      })
    })
    
    mutualPrereqs = mutualPairs
    
    // Create logic gates and links - skip mutual prereq reverse edges
    nodes.forEach(node => {
      if ('isGate' in node) return // Skip gates
      
      const prerequisites = node.prerequisites
      
      prerequisites.forEach(prereq => {
        if (!prereq.units || prereq.units.length === 0) return
        
        // Filter to only prerequisites that exist in our MTH graph
        let validPrereqs = prereq.units.filter(code => validNodeIds.has(code))
        
        // Filter out mutual prereq reverse edges
        validPrereqs = validPrereqs.filter(code => {
          return !skipPrereqs.has(`${code}->${node.id}`)
        })
        
        if (validPrereqs.length === 0) return // Skip if no valid prerequisites
        
        // Determine if AND or OR based on original requirement
        const isAnd = prereq.NumReq === prereq.units.length
        const gateType = isAnd ? 'AND' : 'OR'
        
        if (validPrereqs.length === 1) {
          // Direct link, no gate needed
          links.push({
            source: validPrereqs[0],
            target: node.id
          })
        } else {
          // Create logic gate with proper structure for force-graph
          const gateNode: LogicGate = {
            id: `gate-${gateId++}`,
            title: `${gateType} Gate`,
            level: node.level - 500, // Place between levels
            prerequisites: [],
            color: COLORS.gate,
            isGate: true,
            gateType: gateType
          }
          
          // Add gate to valid nodes
          validNodeIds.add(gateNode.id)
          nodes.push(gateNode)
          
          // Links from prerequisites to gate
          validPrereqs.forEach(prereqCode => {
            links.push({
              source: prereqCode,
              target: gateNode.id,
              isToGate: true
            })
          })
          
          // Link from gate to target unit
          links.push({
            source: gateNode.id,
            target: node.id,
            isFromGate: true
          })
        }
      })
    })
    
    // Final validation: remove any links that reference non-existent nodes
    const validLinks = links.filter(link => {
      const sourceExists = validNodeIds.has(typeof link.source === 'string' ? link.source : link.source.id)
      const targetExists = validNodeIds.has(typeof link.target === 'string' ? link.target : link.target.id)
      return sourceExists && targetExists
    })
    
    graphData = { nodes, links: validLinks }
  }
  
  
  function closeDetails() {
    selectedUnit = null
  }
</script>

<div class="min-h-screen bg-base-200 flex flex-col">
  <!-- Header -->
  <div class="navbar bg-base-100 shadow-lg flex-none">
    <div class="flex-1">
      <a href="/monash-graph" class="btn btn-ghost normal-case text-xl">
        ← MTH Unit Flow Chart (Prototype)
      </a>
    </div>
    <div class="flex-none">
      <div class="badge badge-info">ANU-Style Flowchart</div>
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- Graph -->
    <div class="flex-1 relative">
      <div 
        bind:this={graphContainer}
        class="w-full h-full"
      ></div>
    </div>
    
    <!-- Sidebar -->
    <div class="w-80 bg-base-100 shadow-xl overflow-y-auto flex-none p-4 space-y-4">
      <div class="card bg-base-300">
        <div class="card-body">
          <h2 class="card-title text-sm">Legend</h2>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-8 h-6" style="background-color: {COLORS[1000]}"></div>
              <span>1000 Level (Foundational)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-6" style="background-color: {COLORS[2000]}"></div>
              <span>2000 Level (Intermediate)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-6" style="background-color: {COLORS[3000]}"></div>
              <span>3000 Level (Advanced)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-6" style="background-color: {COLORS[4000]}"></div>
              <span>4000 Level (Honours)</span>
            </div>
            <div class="divider my-1"></div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style="background-color: {COLORS.gate}">
                AND
              </div>
              <span>All prerequisites required</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style="background-color: {COLORS.gate}">
                OR
              </div>
              <span>Any prerequisite works</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card bg-base-300">
        <div class="card-body">
          <h2 class="card-title text-sm">Layout Mode</h2>
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-2">
              <input 
                type="checkbox" 
                class="toggle toggle-sm" 
                bind:checked={useDagMode}
              />
              <span class="label-text text-xs">Hierarchical (Left→Right)</span>
            </label>
          </div>
          {#if mutualPrereqs.length > 0}
            <div class="alert alert-info p-2 text-xs mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Mutual prerequisites detected. Showing simplified DAG.</span>
            </div>
          {/if}
        </div>
      </div>
      
      <div class="card bg-base-300">
        <div class="card-body">
          <h2 class="card-title text-sm">Example Pathway</h2>
          <div class="text-xs space-y-1">
            <p class="font-semibold">Typical progression:</p>
            <div class="pl-2">
              <p>1. MTH1020 (if no HS higher math)</p>
              <p>↓</p>
              <p>2. MTH1030 (Calc + LinAlg)</p>
              <p>↓</p>
              <p>3. MTH2010, MTH2021, MTH2140</p>
              <p>↓</p>
              <p>4. MTH3160 and other 3000-level</p>
            </div>
            {#if mutualPrereqs.length > 0}
              <div class="divider my-1"></div>
              <p class="font-semibold">Mutual Prerequisites:</p>
              <div class="pl-2 space-y-1">
                {#each mutualPrereqs as pair}
                  <p class="text-xs">• {pair}</p>
                {/each}
                <p class="text-xs opacity-70 italic">Can take either first</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
      
      {#if selectedUnit && !selectedUnit.isGate}
        <div class="card bg-primary text-primary-content">
          <div class="card-body p-4">
            <div class="flex justify-between items-start">
              <h2 class="card-title text-sm">{selectedUnit.id || 'Unknown'}</h2>
              <button class="btn btn-ghost btn-xs" on:click={closeDetails}>✕</button>
            </div>
            <p class="text-xs">{selectedUnit.title || ''}</p>
            {#if selectedUnit.level}
              <div class="badge badge-sm">Level {selectedUnit.level / 1000}</div>
            {/if}
            
            {#if selectedUnit.prerequisites && selectedUnit.prerequisites.length > 0}
              <div class="text-xs mt-2">
                <p class="font-semibold">Prerequisites:</p>
                {#each selectedUnit.prerequisites as prereq}
                  {#if prereq && prereq.units && prereq.units.length > 0}
                    <div class="pl-2 mt-1">
                      <p>Requires {prereq.NumReq || 1} of:</p>
                      <ul class="list-disc list-inside pl-2">
                        {#each prereq.units as unit}
                          <li>{unit}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                {/each}
              </div>
            {:else}
              <div class="text-xs mt-2">
                <p class="italic opacity-70">No prerequisites</p>
              </div>
            {/if}
          </div>
        </div>
      {/if}
      
      <div class="alert alert-info text-xs p-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Click on units to see details. Scroll to zoom, drag to pan.</span>
      </div>
    </div>
  </div>
</div>
