<script lang="ts">
  import { experience } from '$lib/stores/portfolio' // store with data
  import Badge from '$lib/components/portable-portfolio/badge.svelte'
  import { fly } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'

  /* --- tag list --- */
  const options = [...new Set(get(experience).flatMap(e => e.tags))]

  let selected = ''
  onMount(() => {
    if (options.length) selected = options[0]
  })

  /* reactive filtered list */
  $: visible = get(experience).filter(e => e.tags.includes(selected))
</script>

<section id="experience" class="max-w-3xl mx-auto pb-36 px-4 text-center">
  <!-- heading -->
  <div class="flex items-center gap-4 mb-8">
    <div class="flex items-center gap-2">
      <span class="font-extrabold">Experience</span>
    </div>
    <hr class="flex-grow border-t" />
  </div>

  <!-- filter buttons -->
  <div class="flex justify-center mb-8 gap-2">
    {#each options as tag}
      <button
        class={`bg-base-100 px-3 py-1 rounded border  md:rounded-box ${selected === tag ? ` md:shadow-xl` : 'border-gray-300'}`}
        on:click={() => (selected = tag)}>
        {tag}
      </button>
    {/each}
  </div>

  <!-- cards -->
  <div class="space-y-4">
    {#each visible as exp (exp.id)}
      <!-- fade-in / slide-up -->
      <div in:fly={{ y: 24, duration: 250 }} class="rounded-lg shadow p-4 bg-base-100">
        <!-- header -->
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <img src={exp.img} alt={exp.company} class="h-12 w-auto rounded" />
            <div class="text-left">
              <p class="font-semibold">{exp.company}</p>
              {#if exp.position}<p>{exp.position}</p>{/if}
            </div>
          </div>
          {#if exp.duration}
            <p class="text-sm opacity-70">{exp.duration}</p>
          {/if}
        </div>

        <!-- body -->
        {#if exp.listItems?.length}
          <ul class="mt-3 space-y-1 text-left">
            {#each exp.listItems as li}
              <li class="flex gap-1">
                <!-- chevron -->
                <svg class={`h-4 w-4`} fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span>{li}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-3 text-left">{exp.description}</p>
        {/if}

        <!-- footer -->
        <div class="mt-4 flex flex-wrap gap-2">
          {#each exp.badges ?? [] as b}
            <Badge name={b} />
          {/each}

          {#each exp.buttons ?? [] as btn}
            <a class={` underline text-sm`} href={btn.href} target="_blank" rel="noopener noreferrer">
              {btn.label}
            </a>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>
