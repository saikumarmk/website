<script lang="ts">
import { experience as experienceStore } from '$lib/stores/portfolio'
import { get } from 'svelte/store'
import { fade } from 'svelte/transition'
import Badge from '$lib/components/portable-portfolio/badge.svelte'
  
  const allExperience = get(experienceStore)
  
  // Flatten experience into timeline items
  const timelineItems = allExperience.flatMap(exp => 
    exp.positions.map(pos => ({
      company: exp.company,
      img: exp.img,
      position: pos.position,
      duration: pos.duration,
      listItems: pos.listItems,
      description: pos.description,
      badges: pos.badges ?? [],
      buttons: pos.buttons ?? [],
      tags: exp.tags,
      // Parse year for sorting (take the end year or "Current")
      sortYear: pos.duration.includes('Current') ? 9999 : 
                parseInt(pos.duration.split('-')[1]?.trim() || pos.duration.split('-')[0]?.trim() || '0')
    }))
  ).sort((a, b) => b.sortYear - a.sortYear)
  
  function getCategoryClass(tags: string[]) {
    if (tags.includes('Work')) return 'border-primary'
    if (tags.includes('Education')) return 'border-secondary'
    if (tags.includes('Extracurricular')) return 'border-accent'
    return 'border-base-content/20'
  }
</script>

<svelte:head>
  <title>Portfolio | saikumarmk.com</title>
</svelte:head>

<div class="container mx-auto px-4 py-20">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold mb-4">Portfolio</h1>
      <p class="text-lg opacity-70 mb-8">Experience, projects, and skills</p>
      
      <!-- View switcher -->
      <div class="flex justify-center gap-2 flex-wrap">
        <a href="/portfolio/projects" class="btn btn-primary gap-2">
          <span class="i-heroicons-outline-squares-2x2 w-5 h-5"></span>
          Project Dex
        </a>
        <a href="/portfolio/list" class="btn btn-ghost gap-2">
          <span class="i-heroicons-outline-list-bullet w-5 h-5"></span>
          List View
        </a>
      </div>
    </div>
    
    <!-- Timeline View -->
    <div in:fade={{ duration: 300 }} class="relative">
      <!-- Center line -->
      <div class="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden md:block"></div>
      
      <div class="space-y-12">
        {#each timelineItems as item, idx}
          <div class="relative">
            <div class="md:flex md:items-start {idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}">
              <div class="md:w-1/2 {idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}">
                <div class="card bg-base-200 hover:bg-base-300 transition-all p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 duration-300 border-l-4 {getCategoryClass(item.tags)}">
                  <!-- Company header -->
                  <div class="flex items-center gap-3 mb-3">
                    <img src={item.img} alt={item.company} class="h-10 w-auto rounded" />
                    <div>
                      <h3 class="font-bold text-lg">{item.position}</h3>
                      <p class="text-sm opacity-70">{item.company}</p>
                    </div>
                  </div>
                  
                  <div class="text-sm opacity-60 mb-3">{item.duration}</div>
                  
                  <!-- Content -->
                  {#if item.listItems?.length}
                    <ul class="space-y-2 text-sm mb-4">
                      {#each item.listItems as li}
                        <li class="flex gap-2">
                          <span class="i-heroicons-outline-chevron-right w-4 h-4 flex-shrink-0 mt-0.5 text-primary"></span>
                          <span>{li}</span>
                        </li>
                      {/each}
                    </ul>
                  {:else if item.description}
                    <p class="text-sm mb-4">{item.description}</p>
                  {/if}
                  
                  <!-- Footer -->
                  <div class="flex flex-wrap gap-2">
                    {#each item.badges as badge}
                      <Badge name={badge} />
                    {/each}
                    {#each item.buttons as btn}
                      <a href={btn.href} target="_blank" rel="noopener noreferrer" class="text-sm underline opacity-70 hover:opacity-100">
                        {btn.label}
                      </a>
                    {/each}
                  </div>
                </div>
              </div>
              
              <!-- Timeline dot -->
              <div class="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-8 w-4 h-4 rounded-full ring-4 ring-base-100 z-10 {item.tags.includes('Work') ? 'bg-primary' : item.tags.includes('Education') ? 'bg-secondary' : 'bg-accent'}"></div>
              
              <div class="hidden md:block md:w-1/2"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
