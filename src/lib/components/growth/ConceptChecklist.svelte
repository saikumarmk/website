<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let nodeId: string;
  export let concepts: Array<{ id: string; title: string }> = [];

  let completedConcepts = new Set<string>();

  // Load completion state from localStorage
  onMount(() => {
    if (!browser) return;
    
    concepts.forEach((concept) => {
      const key = `growth-concept-${nodeId}-${concept.id}`;
      if (localStorage.getItem(key) === 'true') {
        completedConcepts.add(concept.id);
      }
    });
    completedConcepts = completedConcepts; // Trigger reactivity
  });

  function toggleConcept(conceptId: string) {
    if (!browser) return;
    
    const key = `growth-concept-${nodeId}-${conceptId}`;
    if (completedConcepts.has(conceptId)) {
      completedConcepts.delete(conceptId);
      localStorage.removeItem(key);
    } else {
      completedConcepts.add(conceptId);
      localStorage.setItem(key, 'true');
    }
    completedConcepts = completedConcepts; // Trigger reactivity
  }

  $: progress = concepts.length > 0 ? completedConcepts.size / concepts.length : 0;
  $: progressPercent = Math.round(progress * 100);
</script>

{#if concepts.length > 0}
  <div class="concept-checklist my-6">
    <!-- Progress Header -->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold flex items-center gap-2">
        <span>📋 Concepts</span>
        {#if progress === 1}
          <span class="badge badge-success">✓ Complete</span>
        {/if}
      </h3>
      <div class="text-sm opacity-70">
        {completedConcepts.size} / {concepts.length} mastered
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar-container mb-4">
      <progress class="progress progress-primary w-full" value={progressPercent} max="100">
        {progressPercent}%
      </progress>
    </div>

    <!-- Concept List -->
    <div class="space-y-2">
      {#each concepts as concept}
        {@const isComplete = completedConcepts.has(concept.id)}
        <label
          class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-base-200"
          class:bg-success={isComplete}
          class:bg-opacity-10={isComplete}
        >
          <input
            type="checkbox"
            class="checkbox checkbox-primary"
            checked={isComplete}
            on:change={() => toggleConcept(concept.id)}
          />
          <span class="flex-1" class:line-through={isComplete} class:opacity-60={isComplete}>
            {concept.title}
          </span>
          {#if isComplete}
            <span class="text-success">✓</span>
          {/if}
        </label>
      {/each}
    </div>

    {#if progress === 1}
      <div class="alert alert-success mt-4">
        <span>🎉 All concepts mastered! Consider updating the node status.</span>
      </div>
    {/if}
  </div>
{/if}

<style>
  .concept-checklist {
    border-left: 4px solid var(--p);
    padding-left: 1rem;
  }
</style>







