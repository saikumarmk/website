<script lang="ts">
  import { experience as experienceStore, projects as projectsStore } from '$lib/stores/portfolio'
  import { get } from 'svelte/store'
  import { fade, fly } from 'svelte/transition'
  import Badge from '$lib/components/portable-portfolio/badge.svelte'
  
  type View = 'timeline' | 'carousel' | 'skills'
  
  let currentView: View = 'timeline'
  let currentProjectIndex = 0
  let touchStartX = 0
  let touchEndX = 0
  
  const allExperience = get(experienceStore)
  const allProjects = get(projectsStore)
  
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
  
  // Skills data derived from tech stack
  const skillCategories = [
    {
      name: 'Machine Learning & AI',
      color: 'primary',
      skills: [
        { name: 'Diffusion Models', level: 90 },
        { name: 'PyTorch', level: 90 },
        { name: 'Computer Vision', level: 85 },
        { name: 'GPT/LLMs', level: 75 }
      ]
    },
    {
      name: 'Programming',
      color: 'secondary',
      skills: [
        { name: 'Python', level: 95 },
        { name: 'TypeScript', level: 85 },
        { name: 'Rust', level: 70 },
        { name: 'C/C++', level: 75 },
        { name: 'Go', level: 70 }
      ]
    },
    {
      name: 'Web & Data Viz',
      color: 'accent',
      skills: [
        { name: 'React', level: 85 },
        { name: 'SvelteKit', level: 90 },
        { name: 'FastAPI', level: 85 },
        { name: 'Streamlit', level: 80 },
        { name: 'D3.js/Mapbox', level: 75 }
      ]
    },
    {
      name: 'Tools & Systems',
      color: 'info',
      skills: [
        { name: 'Git', level: 90 },
        { name: 'PostgreSQL', level: 75 },
        { name: 'WebAssembly', level: 70 },
        { name: 'Docker', level: 70 }
      ]
    }
  ]
  
  // Carousel functions
  function nextProject() {
    currentProjectIndex = (currentProjectIndex + 1) % allProjects.length
  }
  
  function prevProject() {
    currentProjectIndex = (currentProjectIndex - 1 + allProjects.length) % allProjects.length
  }
  
  function goToProject(index: number) {
    currentProjectIndex = index
  }
  
  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX
  }
  
  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX
    if (touchStartX - touchEndX > 50) nextProject()
    if (touchEndX - touchStartX > 50) prevProject()
  }
  
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
        <button 
          on:click={() => currentView = 'timeline'}
          class="btn {currentView === 'timeline' ? 'btn-primary' : 'btn-ghost'}">
          <span class="i-heroicons-outline-clock w-5 h-5"></span>
          Timeline
        </button>
        <button 
          on:click={() => currentView = 'carousel'}
          class="btn {currentView === 'carousel' ? 'btn-primary' : 'btn-ghost'}">
          <span class="i-heroicons-outline-rectangle-stack w-5 h-5"></span>
          Projects
        </button>
        <a href="/portfolio/list" class="btn btn-ghost">
          <span class="i-heroicons-outline-list-bullet w-5 h-5"></span>
          List View
        </a>
      </div>
    </div>
    
    <!-- Timeline View -->
    {#if currentView === 'timeline'}
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
    {/if}
    
    <!-- Carousel View -->
    {#if currentView === 'carousel'}
      <div in:fade={{ duration: 300 }} class="relative">
        <div 
          class="card bg-base-200 shadow-2xl overflow-hidden"
          on:touchstart={handleTouchStart}
          on:touchend={handleTouchEnd}
          role="region"
          aria-label="Project carousel">
          
          <div class="relative overflow-hidden">
            <div 
              class="flex transition-transform duration-500 ease-out"
              style="transform: translateX(-{currentProjectIndex * 100}%)">
              {#each allProjects as project}
                <div class="min-w-full p-8 md:p-12">
                  <div class="max-w-2xl mx-auto">
                    <h2 class="text-3xl font-bold mb-4">{project.name}</h2>
                    <p class="text-lg opacity-80 mb-6">{project.description}</p>
                    
                    <div class="flex flex-wrap gap-2 mb-6">
                      {#each project.badges ?? [] as badge}
                        <Badge name={badge} />
                      {/each}
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                      {#if project.link}
                        <a href={project.link} class="btn btn-primary gap-2" target="_blank" rel="noopener noreferrer">
                          <span class="i-heroicons-outline-arrow-top-right-on-square w-4 h-4"></span>
                          View on GitHub
                        </a>
                      {/if}
                      {#each project.buttons ?? [] as btn}
                        <a href={btn.href} class="btn btn-secondary gap-2" target="_blank" rel="noopener noreferrer">
                          {btn.label}
                          <span class="i-heroicons-outline-arrow-top-right-on-square w-4 h-4"></span>
                        </a>
                      {/each}
                    </div>
                    
                    {#if project.tags && project.tags.length > 0}
                      <div class="mt-6 flex gap-2 flex-wrap">
                        {#each project.tags as tag}
                          <span class="badge badge-outline">{tag}</span>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Navigation -->
          <button
            on:click={prevProject}
            class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-lg btn-ghost hover:btn-primary"
            aria-label="Previous project">
            <span class="i-heroicons-outline-chevron-left w-8 h-8"></span>
          </button>
          
          <button
            on:click={nextProject}
            class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-lg btn-ghost hover:btn-primary"
            aria-label="Next project">
            <span class="i-heroicons-outline-chevron-right w-8 h-8"></span>
          </button>
        </div>
        
        <!-- Indicators -->
        <div class="flex justify-center gap-2 mt-6">
          {#each allProjects as _, index}
            <button
              on:click={() => goToProject(index)}
              class="w-3 h-3 rounded-full transition-all {index === currentProjectIndex ? 'bg-primary w-8' : 'bg-base-content/30 hover:bg-base-content/50'}"
              aria-label="Go to project {index + 1}">
            </button>
          {/each}
        </div>
        
        <div class="text-center mt-4 opacity-60 text-sm">
          {currentProjectIndex + 1} / {allProjects.length}
        </div>
      </div>
    {/if}
    
    <!-- Skills View -->
    {#if currentView === 'skills'}
      <div in:fade={{ duration: 300 }}>
        <!-- Skills Grid -->
        <div class="grid md:grid-cols-2 gap-6 mb-12">
          {#each skillCategories as category}
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h2 class="card-title text-{category.color} mb-4">
                  {category.name}
                </h2>
                
                <div class="space-y-4">
                  {#each category.skills as skill}
                    <div>
                      <div class="flex justify-between text-sm mb-1">
                        <span class="font-medium">{skill.name}</span>
                        <span class="opacity-60">{skill.level}%</span>
                      </div>
                      <div class="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                        <div 
                          class="bg-{category.color} h-full rounded-full transition-all duration-1000 ease-out"
                          style="width: {skill.level}%">
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Overall Distribution -->
        <div class="card bg-base-200 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-6">Overall Skill Distribution</h2>
            <div class="flex flex-wrap justify-center gap-8">
              {#each skillCategories as category}
                {@const avgLevel = category.skills.reduce((sum, s) => sum + s.level, 0) / category.skills.length}
                <div class="text-center">
                  <div class="relative inline-block">
                    <svg class="transform -rotate-90" width="120" height="120">
                      <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="10" fill="none" class="opacity-20" />
                      <circle
                        cx="60" cy="60" r="50" stroke="currentColor" stroke-width="10" fill="none"
                        class="text-{category.color} transition-all duration-1000"
                        stroke-dasharray="314" stroke-dashoffset={314 - (314 * avgLevel / 100)}
                        stroke-linecap="round" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-2xl font-bold">{Math.round(avgLevel)}</span>
                    </div>
                  </div>
                  <div class="mt-4 font-medium">{category.name}</div>
                  <div class="text-sm opacity-60">{category.skills.length} skills</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

