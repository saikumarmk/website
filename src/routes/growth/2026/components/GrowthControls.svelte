<script lang="ts">
  import type { GrowthData, GrowthNode, GraphNode } from '../types';
  import {
    getStatusBadgeClass,
    TIER_LABELS,
    getArtifactIcon,
    BRANCH_POKEMON
  } from '../utils/nodeUtils';

  export let data: GrowthData;
  export let searchQuery: string;
  export let selectedBranches: string[];
  export let selectedTiers: string[];
  export let selectedStatuses: string[];
  export let selectedNode: GraphNode | null = null;
  export let nodeMap: Map<string, GrowthNode>;

  const branches = data.branches;
  const tiers = ['roots', 'trunk', 'branch', 'crown'];
  const statuses = ['locked', 'available', 'in_progress', 'complete'];

  const branchLabels: Record<string, string> = {
    'systems-hpc': 'Systems & HPC',
    'gen-media': 'Gen Media',
    'rl': 'RL',
    'maths': 'Maths',
    'swe': 'SWE',
    'physics': 'Physics'
  };

  const tierLabels: Record<string, string> = {
    roots: 'Roots',
    trunk: 'Trunks',
    branch: 'Branches',
    crown: 'Crowns'
  };

  const statusLabels: Record<string, string> = {
    locked: 'Locked',
    available: 'Available',
    in_progress: 'In Progress',
    complete: 'Complete'
  };

  function toggleBranch(branch: string) {
    if (selectedBranches.includes(branch)) {
      selectedBranches = selectedBranches.filter(b => b !== branch);
    } else {
      selectedBranches = [...selectedBranches, branch];
    }
  }

  function toggleTier(tier: string) {
    if (selectedTiers.includes(tier)) {
      selectedTiers = selectedTiers.filter(t => t !== tier);
    } else {
      selectedTiers = [...selectedTiers, tier];
    }
  }

  function toggleStatus(status: string) {
    if (selectedStatuses.includes(status)) {
      selectedStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      selectedStatuses = [...selectedStatuses, status];
    }
  }

  function clearFilters() {
    searchQuery = '';
    selectedBranches = [];
    selectedTiers = [];
    selectedStatuses = [];
  }
</script>

<div class="h-full flex flex-col bg-base-200 p-4 overflow-y-auto">
  <h2 class="text-2xl font-bold mb-4">Yggdrasil 2026</h2>

  <!-- Search -->
  <div class="form-control mb-4">
    <input
      type="text"
      placeholder="Search skills..."
      class="input input-bordered w-full"
      bind:value={searchQuery}
    />
  </div>

  <!-- Layout Mode (static display) -->
  <div class="mb-4 p-3 bg-base-300 rounded-lg">
    <div class="text-xs font-semibold text-base-content/60 mb-1">LAYOUT MODE</div>
    <div class="text-sm font-bold">LAYERED DAG</div>
  </div>

  <!-- Branches Filter -->
  <div class="mb-4">
    <h3 class="font-bold mb-2 text-sm">Branches</h3>
    <div class="flex flex-wrap gap-2">
      {#each branches as branch}
        <button
          class="btn btn-xs"
          class:btn-primary={selectedBranches.includes(branch)}
          class:btn-ghost={!selectedBranches.includes(branch)}
          on:click={() => toggleBranch(branch)}
        >
          {branchLabels[branch] || branch}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tiers Filter -->
  <div class="mb-4">
    <h3 class="font-bold mb-2 text-sm">Tiers</h3>
    <div class="flex flex-wrap gap-2">
      {#each tiers as tier}
        <button
          class="btn btn-xs"
          class:btn-primary={selectedTiers.includes(tier)}
          class:btn-ghost={!selectedTiers.includes(tier)}
          on:click={() => toggleTier(tier)}
        >
          {tierLabels[tier]}
        </button>
      {/each}
    </div>
  </div>

  <!-- Status Filter -->
  <div class="mb-4">
    <h3 class="font-bold mb-2 text-sm">Status</h3>
    <div class="flex flex-wrap gap-2">
      {#each statuses as status}
        <button
          class="btn btn-xs"
          class:btn-primary={selectedStatuses.includes(status)}
          class:btn-ghost={!selectedStatuses.includes(status)}
          on:click={() => toggleStatus(status)}
        >
          {statusLabels[status]}
        </button>
      {/each}
    </div>
  </div>

  <!-- Clear Filters -->
  <button class="btn btn-sm btn-outline w-full mb-4" on:click={clearFilters}>
    Clear All Filters
  </button>

  <!-- Divider -->
  {#if selectedNode}
    <div class="divider my-2">SELECTED NODE</div>
  {/if}

  <!-- Node Info Section -->
  {#if selectedNode}
    {@const pokemon = BRANCH_POKEMON[selectedNode.branch]}
    <div class="flex flex-col gap-3 p-3 bg-base-300 rounded-lg">
      <!-- Title with Pokemon -->
      <div class="flex items-start gap-3">
        {#if pokemon}
          <div class="pokesprite pokemon {pokemon.name}" title={pokemon.name}></div>
        {/if}
        <h3 class="text-base font-bold leading-tight flex-1" style="image-rendering: pixelated;">
          {selectedNode.title}
        </h3>
      </div>

      <!-- Status & Tier Badges -->
      <div class="flex gap-2 flex-wrap">
        <span class={getStatusBadgeClass(selectedNode.status)}>
          {selectedNode.status}
        </span>
        <span class="badge badge-outline badge-sm">
          {TIER_LABELS[selectedNode.tier]}
        </span>
      </div>

      <!-- Branch -->
      <div>
        <span class="text-xs font-semibold text-base-content/60">BRANCH</span>
        <p class="text-sm">{selectedNode.branch}</p>
      </div>

      <!-- Tags -->
      {#if selectedNode.tags.length > 0}
        <div>
          <span class="text-xs font-semibold text-base-content/60">TAGS</span>
          <div class="flex flex-wrap gap-1 mt-1">
            {#each selectedNode.tags as tag}
              <span class="badge badge-sm">{tag}</span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Prerequisites -->
      {#if selectedNode.prerequisites.length > 0}
        <div>
          <span class="text-xs font-semibold text-base-content/60">PREREQUISITES</span>
          <ul class="text-sm mt-1 space-y-1">
            {#each selectedNode.prerequisites as prereqId}
              {@const prereq = nodeMap.get(prereqId)}
              {#if prereq}
                <li class="flex items-center gap-2">
                  <span class={getStatusBadgeClass(prereq.status)}>
                    {prereq.status === 'complete' ? '✓' : '◦'}
                  </span>
                  <span>{prereq.title}</span>
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Artifact Link -->
      {#if selectedNode.artifact.url}
        <a
          href={selectedNode.artifact.url}
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-sm btn-outline"
        >
          {getArtifactIcon(selectedNode.artifact.type)} View {selectedNode.artifact.type}
        </a>
      {/if}

      <!-- View Page Button -->
      <a href={selectedNode.page_path} class="btn btn-sm btn-primary">
        📄 View Page
      </a>
    </div>
  {/if}
</div>



