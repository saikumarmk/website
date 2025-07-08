<script lang="ts">
  import { projects } from '$lib/stores/portfolio' // store with data
  import { fly } from 'svelte/transition'
  import { get } from 'svelte/store'
  import Badge from '$lib/components/portable-portfolio/badge.svelte'
  let color = 'teal'

  /* --- tag list --- */
  const options = [
    'All',
    ...new Set(
      get(projects)
        .flatMap(p => p.tags ?? [])
        .filter(Boolean)
    )
  ]

  let selected = 'All'

  /* reactive filtered list */
  $: filteredProjects = selected === 'All' ? get(projects) : get(projects).filter(p => p.tags?.includes(selected))
</script>

<section id="projects" class="max-w-3xl mx-auto pb-36 px-4 text-center">
  <!-- heading -->
  <div class="text-left mb-6">
    <h2 class="text-xl font-bold mb-4">Projects</h2>
  </div>

  <!-- filter buttons -->
  <div class="flex justify-center my-8 gap-2">
    {#each options as tag}
      <button
        class={`bg-base-100 px-3 py-1 rounded border md:rounded-box ${selected === tag ? 'md:shadow-xl' : 'border-gray-300'}`}
        on:click={() => (selected = tag)}>
        {tag}
      </button>
    {/each}
  </div>

  <!-- projects grid -->
  <div class="grid gap-5 px-4" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
    {#each filteredProjects as project (project.id)}
      <div in:fly={{ y: 24, duration: 250 }} class="rounded-lg shadow p-4 bg-base-100 h-full flex flex-col">
        <!-- GitHub link icon (if link exists) -->
        {#if project.link}
          <div class="flex justify-end">
            <a href={project.link} target="_blank" rel="noopener noreferrer" class="hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        {/if}

        <h3 class="text-lg font-bold text-left">{project.name}</h3>

        {#if project.description}
          <p class="py-2 text-left flex-grow">{project.description}</p>
        {/if}

        {#if project.buttons?.length}
          <div class="flex gap-2">
            {#each project.buttons as btn}
              <a href={btn.href} target="_blank" rel="noopener noreferrer" class={`text-sm text-${color}-400 hover:underline`}>
                {btn.label}
              </a>
            {/each}
          </div>
        {/if}

        {#if project.badges?.length}
          <div class="flex flex-wrap gap-2 pt-4">
            {#each project.badges ?? [] as b}
              <Badge name={b} />
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
