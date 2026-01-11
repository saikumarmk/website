<script lang="ts">
  import { posts as storedPosts } from '$lib/stores/posts'
  import { site } from '$lib/config/site'
  import { getReadingTime } from '$lib/utils/reading-time'
  import Head from '$lib/components/head.svelte'
  import Footer from '$lib/components/footer.svelte'
  
  let allPosts: Urara.Post[] = []
  
  storedPosts.subscribe(posts => {
    if (Array.isArray(posts)) {
      allPosts = posts.filter(post => !post.flags?.includes('unlisted'))
    }
  })
  
  // Helper to check if post is a learning note (Yggdrasil)
  function isLearningNote(post: Urara.Post): boolean {
    return post.path?.startsWith('/growth/2026/') || 
           post.tags?.includes('yggdrasil') ||
           post.tags?.includes('learning-note') ||
           (post as any).growth !== undefined
  }
  
  // Filter out Yggdrasil pages from homepage
  $: blogPosts = allPosts.filter(post => !isLearningNote(post))
  
  // Featured posts (you can add a 'featured' flag to posts later)
  $: featuredPosts = blogPosts.slice(0, 3)
  
  // Latest 5 posts
  $: latestPosts = blogPosts.slice(0, 5)
</script>

<Head />

<div class="min-h-screen">
  <!-- Hero Section - Horizontal Layout -->
  <div class="border-b border-base-content/10 bg-gradient-to-br from-primary/5 to-secondary/5">
    <div class="container mx-auto px-4 py-10 md:py-12 max-w-5xl">
      <div class="flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <!-- Avatar -->
        {#if site.author.avatar}
          <div class="flex-shrink-0">
            <img 
              src={site.author.avatar} 
              alt={site.author.name}
              class="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-xl ring-4 ring-primary/20"
            />
          </div>
        {/if}
        
        <!-- Text Content -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl md:text-4xl font-bold mb-2">
            Hi, I'm <span class="text-primary">{site.author.name}</span>
          </h1>
          <p class="text-base md:text-lg opacity-80 mb-3">{@html site.author.bio}</p>
          <p class="text-sm opacity-60 mb-4 max-w-xl">
            Applied Scientist at Canva working on training photo and video models. 
            I write about machine learning, tech careers, and software engineering.
          </p>
          
          <div class="flex gap-2 justify-center md:justify-start flex-wrap">
            <a href="/about" class="btn btn-primary btn-sm gap-2">
              <span class="i-heroicons-outline-user w-4 h-4"></span>
              About Me
            </a>
            <a href={site.author.metadata?.[0]?.link} target="_blank" class="btn btn-outline btn-sm gap-2">
              <span class="i-heroicons-outline-code-bracket w-4 h-4"></span>
              GitHub
            </a>
            <a href="/assets/resume.pdf" target="_blank" class="btn btn-ghost btn-sm gap-2">
              <span class="i-heroicons-outline-document-text w-4 h-4"></span>
              Résumé
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-10 max-w-5xl">
    <!-- Featured/Pinned Posts -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-5">Featured Posts</h2>
      
      <div class="grid md:grid-cols-3 gap-4">
        {#each featuredPosts as post}
          {@const readTime = getReadingTime(post.html)}
          <a 
            href={post.path}
            class="card bg-gradient-to-br from-primary/10 to-secondary/10 hover:shadow-xl transition-all p-5 group relative overflow-hidden">
            <div class="absolute top-3 right-3">
              <span class="badge badge-primary badge-sm">Featured</span>
            </div>
            <div class="text-xs opacity-60 mb-2">
              {new Date(post.published ?? post.created).toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <h3 class="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
              {post.title || post.path.slice(1)}
            </h3>
            {#if post.summary}
              <p class="text-sm opacity-70 mb-3 line-clamp-2">{post.summary}</p>
            {/if}
            {#if readTime}
              <div class="text-xs opacity-60">{readTime}</div>
            {/if}
          </a>
        {/each}
      </div>
    </div>

    <!-- Highlights Section -->
    <div class="mb-10">
      <h2 class="text-2xl font-bold mb-5">Highlights</h2>
      
      <div class="grid md:grid-cols-3 gap-4">
        <!-- The Playbook -->
        <a href="/playbook" class="card bg-base-200 hover:bg-base-300 hover:shadow-lg transition-all p-5 group">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-book-open w-5 h-5 text-primary"></span>
            </div>
            <h3 class="text-lg font-bold group-hover:text-primary transition-colors">Grad/Intern Playbook</h3>
          </div>
          <p class="text-sm opacity-70 mb-3">
            Guide for students breaking into tech. Timelines, skills, résumés, and applications.
          </p>
          <div class="flex items-center gap-1 text-sm font-semibold text-primary">
            Read Guide <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
          </div>
        </a>

        <!-- Portfolio -->
        <a href="/portfolio" class="card bg-base-200 hover:bg-base-300 hover:shadow-lg transition-all p-5 group">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-briefcase w-5 h-5 text-secondary"></span>
            </div>
            <h3 class="text-lg font-bold group-hover:text-secondary transition-colors">Portfolio</h3>
          </div>
          <p class="text-sm opacity-70 mb-3">
            Professional experience at Canva, research projects, and open-source work.
          </p>
          <div class="flex items-center gap-1 text-sm font-semibold text-secondary">
            View Portfolio <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
          </div>
        </a>

        <!-- Thesis -->
        <a href="/assets/honours_thesis.pdf" target="_blank" class="card bg-base-200 hover:bg-base-300 hover:shadow-lg transition-all p-5 group">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-document-text w-5 h-5 text-accent"></span>
            </div>
            <h3 class="text-lg font-bold group-hover:text-accent transition-colors">Honours Thesis</h3>
          </div>
          <p class="text-sm opacity-70 mb-3">
            Bias modelling in diffusion models. First Class Honours (90/100), Monash 2023.
          </p>
          <div class="flex items-center gap-1 text-sm font-semibold text-accent">
            Read PDF <span class="i-heroicons-outline-arrow-top-right-on-square w-4 h-4"></span>
          </div>
        </a>
      </div>
    </div>

    <!-- Latest Posts -->
    <div>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-2xl font-bold">Latest Posts</h2>
        <a href="/archive" class="btn btn-ghost gap-2">
          View All
          <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
        </a>
      </div>
      
      <div class="space-y-3">
        {#each latestPosts as post}
          {@const readTime = getReadingTime(post.html)}
          <a 
            href={post.path}
            class="card bg-base-200 hover:bg-base-300 hover:shadow-md transition-all p-4 flex flex-row items-center gap-4 group">
            <!-- Date -->
            <div class="flex flex-col items-center text-center min-w-[50px]">
              <div class="text-lg font-bold leading-tight">
                {new Date(post.published ?? post.created).getDate()}
              </div>
              <div class="text-xs opacity-60 uppercase">
                {new Date(post.published ?? post.created).toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold mb-0.5 group-hover:text-primary transition-colors truncate">
                {post.title || post.path.slice(1)}
              </h3>
              {#if post.summary}
                <p class="text-sm opacity-70 truncate">{post.summary}</p>
              {/if}
            </div>

            <!-- Meta -->
            <div class="hidden md:flex items-center gap-3 flex-shrink-0">
              {#if post.tags && post.tags.length > 0}
                <span class="badge badge-sm badge-outline">#{post.tags[0]}</span>
              {/if}
              {#if readTime}
                <span class="text-xs opacity-60 whitespace-nowrap">{readTime}</span>
              {/if}
            </div>

            <span class="i-heroicons-outline-chevron-right w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0"></span>
          </a>
        {/each}
      </div>
    </div>
  </div>

  <Footer />
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

