<script lang="ts">
  import { page } from '$app/stores';
  import growthData from '$lib/../resources/growth2026.json';
  import type { GrowthData, GrowthNode } from '../types';
  import { BRANCH_POKEMON, TIER_LABELS, getStatusBadgeClass } from '../utils/nodeUtils';

  const data = growthData as GrowthData;

  $: nodeId = $page.params.id;
  $: node = data.nodes.find(n => n.id === nodeId);
</script>

<script context="module" lang="ts">
  // Disable prerendering for dynamic fallback route
  // Specific markdown pages will still prerender as individual route folders
  export const prerender = false;
</script>

<svelte:head>
  <title>{node ? node.title : 'Node Not Found'} - Yggdrasil 2026</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="mb-4">
    <a href="/growth/2026" class="btn btn-sm btn-ghost">
      ← Back to Yggdrasil
    </a>
  </div>

  {#if node}
    {@const pokemon = BRANCH_POKEMON[node.branch]}
    <!-- Coming Soon Card -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-4">
          {#if pokemon}
            <div
              class="pokesprite pokemon {pokemon.name}"
              style="transform: scale(2); margin: 1rem;"
            ></div>
          {/if}
          <div class="flex-1">
            <h1 class="card-title text-3xl mb-2">{node.title}</h1>
            <div class="flex gap-2 flex-wrap">
              <span class={getStatusBadgeClass(node.status)}>
                {node.status}
              </span>
              <span class="badge badge-outline">
                {TIER_LABELS[node.tier]}
              </span>
              <span class="badge badge-outline">{node.branch}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Coming Soon Message -->
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🚧</div>
          <h2 class="text-2xl font-bold mb-4">Coming Soon!</h2>
          <p class="text-lg mb-4">
            This page is under construction. Check back later for detailed content on
            <strong>{node.title}</strong>.
          </p>

          {#if node.estimate_hours}
            <p class="text-sm text-base-content/60 mb-4">
              Estimated learning time: {node.estimate_hours} hours
            </p>
          {/if}

          {#if node.tags.length > 0}
            <div class="mb-4">
              <p class="text-sm font-semibold mb-2">Topics covered:</p>
              <div class="flex flex-wrap gap-2 justify-center">
                {#each node.tags as tag}
                  <span class="badge">{tag}</span>
                {/each}
              </div>
            </div>
          {/if}

          <a href="/growth/2026" class="btn btn-primary mt-4">
            Return to Yggdrasil Tree
          </a>
        </div>
      </div>
    </div>
  {:else}
    <!-- Node Not Found -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body text-center">
        <h1 class="card-title text-3xl justify-center mb-4">Node Not Found</h1>
        <p class="text-lg mb-4">
          The node <code class="bg-base-300 px-2 py-1 rounded">{nodeId}</code> doesn't
          exist in Yggdrasil 2026.
        </p>
        <a href="/growth/2026" class="btn btn-primary">
          Return to Yggdrasil Tree
        </a>
      </div>
    </div>
  {/if}
</div>



