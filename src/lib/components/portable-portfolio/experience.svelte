<script lang="ts">
  import { experience } from '$lib/stores/portfolio'
  import Badge from '$lib/components/portable-portfolio/badge.svelte'
  import { fly } from 'svelte/transition'
  import { get } from 'svelte/store'

  // Static categories
  const categories = ['Work', 'Education', 'Extracurricular']

  // All data in the store
  const allEntries = get(experience)

  // Helper to filter by tag
  const byCategory = (tag: string) => allEntries.filter(e => e.tags.includes(tag))
</script>

<section id="experience" class="relative z-10 max-w-3xl mx-auto pb-36 px-4 text-center">
  <!-- top heading -->
  <div class="text-left mb-6">
    <h2 class="text-xl font-bold mb-4">My Portfolio</h2>
  </div>

  {#each categories as category}
    {#if byCategory(category).length}
      <div class="text-left mb-6">
        <h2 class="text-xl font-bold mb-4">{category}</h2>

        <div class="space-y-4">
          {#each byCategory(category) as exp (exp.id)}
            <div in:fly={{ y: 24, duration: 250 }} class="rounded-lg shadow p-4 bg-base-100">
              <!-- company header -->
              <div class="flex items-center gap-3 mb-4">
                <img src={exp.img} alt={exp.company} class="h-12 w-auto rounded" />
                <p class="font-semibold text-lg">{exp.company}</p>
              </div>

              <!-- positions -->
              <div class="space-y-6">
                {#each exp.positions as pos}
                  <div class="pl-4 border-l-2 border-base-300">
                    <!-- position header -->
                    <div class="flex justify-between items-start mb-2">
                      <p class="font-medium">{pos.position}</p>
                      <p class="text-sm opacity-70">{pos.duration}</p>
                    </div>

                    <!-- body -->
                    {#if pos.listItems?.length}
                      <ul class="mt-2 space-y-1 text-left">
                        {#each pos.listItems as li}
                          <li class="flex gap-1">
                            <svg class="h-4 w-4 flex-shrink-0 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                            <span>{li}</span>
                          </li>
                        {/each}
                      </ul>
                    {:else if pos.description}
                      <p class="mt-2 text-left">{pos.description}</p>
                    {/if}

                    <!-- footer -->
                    <div class="mt-3 flex flex-wrap gap-2">
                      {#each pos.badges ?? [] as b}
                        <Badge name={b} />
                      {/each}

                      {#each pos.buttons ?? [] as btn}
                        <a class="underline text-sm" href={btn.href} target="_blank" rel="noopener noreferrer">
                          {btn.label}
                        </a>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</section>
