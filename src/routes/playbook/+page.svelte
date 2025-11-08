<script lang="ts">
  import { fly, fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  
  interface PlaybookPart {
    number: number
    title: string
    description: string
    slug: string
    icon: string
  }
  
  const parts: PlaybookPart[] = [
    {
      number: 0,
      title: 'FAQ',
      description: 'Common questions about internships, grad roles, and the tech industry',
      slug: 'guide-to-tech-faq',
      icon: 'i-heroicons-outline-question-mark-circle'
    },
    {
      number: 1,
      title: 'Timeline',
      description: 'When to start applying and what to do at each stage of your degree',
      slug: 'guide-to-tech-1',
      icon: 'i-heroicons-outline-calendar'
    },
    {
      number: 2,
      title: 'Improving',
      description: 'Building skills, projects, and experience to stand out',
      slug: 'guide-to-tech-2',
      icon: 'i-heroicons-outline-arrow-trending-up'
    },
    {
      number: 2.5,
      title: 'Résumé',
      description: 'Crafting a compelling résumé that gets you interviews',
      slug: 'guide-to-tech-2.5',
      icon: 'i-heroicons-outline-document-text'
    },
    {
      number: 3,
      title: 'Applying',
      description: 'Navigating applications, interviews, and offers',
      slug: 'guide-to-tech-3',
      icon: 'i-heroicons-outline-briefcase'
    }
  ]
  
  let mounted = false
  
  onMount(() => {
    mounted = true
  })
</script>

<svelte:head>
  <title>The Grad/Intern Playbook | saikumarmk.com</title>
  <meta name="description" content="A comprehensive guide to landing your first tech internship or graduate role" />
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section -->
  <div class="hero min-h-[60vh] bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20">
    <div class="hero-content text-center">
      <div class="max-w-3xl">
        {#if mounted}
          <div in:fly={{ y: 20, duration: 600, delay: 100 }}>
            <div class="inline-block mb-4">
              <span class="badge badge-primary badge-lg gap-2">
                <span class="i-heroicons-outline-book-open w-4 h-4"></span>
                Complete Guide
              </span>
            </div>
            <h1 class="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              The Grad/Intern Playbook
            </h1>
            <p class="text-xl md:text-2xl mb-4 opacity-80">
              Your roadmap to landing a tech internship or graduate role
            </p>
            <p class="text-lg opacity-60 max-w-2xl mx-auto">
              A comprehensive guide covering everything from when to start applying, 
              to building your skills, crafting your résumé, and acing the interview.
            </p>
          </div>
          
          <div class="flex gap-4 justify-center mt-8" in:fly={{ y: 20, duration: 600, delay: 300 }}>
            <a href="/guide-to-tech-1" class="btn btn-primary btn-lg gap-2">
              <span class="i-heroicons-outline-rocket-launch w-5 h-5"></span>
              Start Reading
            </a>
            <a href="/guide-to-tech-faq" class="btn btn-outline btn-lg gap-2">
              <span class="i-heroicons-outline-question-mark-circle w-5 h-5"></span>
              Read FAQ
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Parts Section -->
  {#if mounted}
    <div class="max-w-6xl mx-auto px-4 py-16" in:fly={{ y: 20, duration: 600, delay: 600 }}>
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">The Complete Guide</h2>
        <p class="text-lg opacity-70">Read in order, or jump to what you need</p>
      </div>
      
      <div class="space-y-4">
        {#each parts as part, i}
          <a 
            href="/{part.slug}"
            class="card bg-base-200 hover:bg-base-300 transition-all hover:shadow-xl hover:scale-[1.02] group"
            in:fly={{ x: -20, duration: 400, delay: 700 + i * 100 }}>
            <div class="card-body">
              <div class="flex items-start gap-4">
                <!-- Number/Icon -->
                <div class="flex-none">
                  <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    {#if part.number === 0}
                      <span class="{part.icon} w-8 h-8 text-primary"></span>
                    {:else if part.number === 2.5}
                      <span class="text-2xl font-bold text-primary">2½</span>
                    {:else}
                      <span class="text-2xl font-bold text-primary">{part.number}</span>
                    {/if}
                  </div>
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-2xl font-bold group-hover:text-primary transition-colors">
                      {part.title}
                    </h3>
                    <span class="{part.icon} w-5 h-5 opacity-60"></span>
                  </div>
                  <p class="opacity-70">{part.description}</p>
                </div>
                
                <!-- Arrow -->
                <div class="flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="i-heroicons-outline-arrow-right w-6 h-6"></span>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>

