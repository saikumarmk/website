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
  
  // Featured posts (you can add a 'featured' flag to posts later)
  $: featuredPosts = allPosts.slice(0, 3)
  
  // Latest 5 posts
  $: latestPosts = allPosts.slice(0, 5)
</script>

<Head />

<div class="min-h-screen">
  <!-- Hero Section -->
  <div class="hero min-h-[50vh] bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-base-content/10">
    <div class="hero-content text-center max-w-3xl">
      <div>
        {#if site.author.avatar}
          <img 
            src={site.author.avatar} 
            alt={site.author.name}
            class="w-24 h-24 rounded-full shadow-xl mx-auto mb-6"
          />
        {/if}
        <h1 class="text-5xl font-bold mb-4">Hi, I'm {site.author.name}</h1>
        <p class="text-xl opacity-80 mb-6">{@html site.author.bio}</p>
        <p class="text-lg opacity-60 max-w-2xl mx-auto">
          Applied Scientist at Canva working on generative AI and diffusion models. 
          I write about machine learning, tech careers, and software engineering.
        </p>
        
        <div class="flex gap-3 justify-center flex-wrap mt-8">
          <a href="/about" class="btn btn-primary gap-2">
            <span class="i-heroicons-outline-user w-4 h-4"></span>
            Learn More
          </a>
          <a href={site.author.metadata?.[0]?.link} target="_blank" class="btn btn-outline gap-2">
            <span class="i-heroicons-outline-code-bracket w-4 h-4"></span>
            GitHub
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-16 max-w-6xl">
    <!-- Featured/Pinned Posts -->
    <div class="mb-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold">Featured Posts</h2>
      </div>
      
      <div class="grid md:grid-cols-3 gap-6">
        {#each featuredPosts as post}
          {@const readTime = getReadingTime(post.html)}
          <a 
            href={post.path}
            class="card bg-gradient-to-br from-primary/10 to-secondary/10 hover:shadow-2xl transition-all p-8 group relative overflow-hidden">
            <div class="absolute top-4 right-4">
              <span class="badge badge-primary">Featured</span>
            </div>
            <div class="text-xs opacity-60 mb-3">
              {new Date(post.published ?? post.created).toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <h3 class="font-bold text-xl mb-4 group-hover:text-primary transition-colors">
              {post.title || post.path.slice(1)}
            </h3>
            {#if post.summary}
              <p class="text-sm opacity-70 mb-4 line-clamp-3">{post.summary}</p>
            {/if}
            {#if readTime}
              <div class="text-xs opacity-60 mt-auto">{readTime}</div>
            {/if}
          </a>
        {/each}
      </div>
    </div>

    <!-- Highlights Section - Expanded -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold mb-8">Highlights</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- The Playbook -->
        <a href="/guide-to-tech-1" class="card bg-base-200 hover:bg-base-300 hover:shadow-xl transition-all p-8 group">
          <div class="mb-4">
            <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-academic-cap w-6 h-6 text-primary"></span>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">The Playbook</h3>
          </div>
          <p class="text-sm opacity-70 mb-4">
            A comprehensive guide for students and early-career professionals breaking into tech. 
            Covers timelines, skill development, resume building, and the application process.
          </p>
          <div class="flex items-center gap-2 text-sm font-semibold text-primary">
            Read the Guide
            <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
          </div>
        </a>

        <!-- Portfolio -->
        <a href="/portfolio" class="card bg-base-200 hover:bg-base-300 hover:shadow-xl transition-all p-8 group">
          <div class="mb-4">
            <div class="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-briefcase w-6 h-6 text-secondary"></span>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-secondary transition-colors">Portfolio</h3>
          </div>
          <p class="text-sm opacity-70 mb-4">
            Explore my professional experience at Canva, research projects, and open-source contributions. 
            View my timeline, skills, and project showcase.
          </p>
          <div class="flex items-center gap-2 text-sm font-semibold text-secondary">
            View Portfolio
            <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
          </div>
        </a>

        <!-- Thesis -->
        <a href="/assets/honours_thesis.pdf" target="_blank" class="card bg-base-200 hover:bg-base-300 hover:shadow-xl transition-all p-8 group">
          <div class="mb-4">
            <div class="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="i-heroicons-outline-document-text w-6 h-6 text-accent"></span>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:text-accent transition-colors">Honours Thesis</h3>
          </div>
          <p class="text-sm opacity-70 mb-4">
            Research on bias modelling and mitigation in diffusion models. 
            First Class Honours (90/100) from Monash University, 2023.
          </p>
          <div class="flex items-center gap-2 text-sm font-semibold text-accent">
            Read Thesis (PDF)
            <span class="i-heroicons-outline-arrow-top-right-on-square w-4 h-4"></span>
          </div>
        </a>
      </div>
    </div>

    <!-- Latest Posts -->
    <div>
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-bold">Latest Posts</h2>
        <a href="/archive" class="btn btn-ghost gap-2">
          View All
          <span class="i-heroicons-outline-arrow-right w-4 h-4"></span>
        </a>
      </div>
      
      <div class="space-y-4">
        {#each latestPosts as post}
          {@const readTime = getReadingTime(post.html)}
          <a 
            href={post.path}
            class="card bg-base-200 hover:bg-base-300 hover:shadow-lg transition-all p-6 flex flex-row items-center gap-6 group">
            <!-- Date -->
            <div class="flex flex-col items-center text-center min-w-[70px]">
              <div class="text-xl font-bold">
                {new Date(post.published ?? post.created).getDate()}
              </div>
              <div class="text-xs opacity-60 uppercase">
                {new Date(post.published ?? post.created).toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div class="text-xs opacity-40">
                {new Date(post.published ?? post.created).getFullYear()}
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h3 class="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                {post.title || post.path.slice(1)}
              </h3>
              {#if post.summary}
                <p class="text-sm opacity-70 line-clamp-2">{post.summary}</p>
              {/if}
            </div>

            <!-- Meta -->
            <div class="hidden md:flex flex-col items-end gap-2">
              {#if post.tags && post.tags.length > 0}
                <div class="flex gap-1">
                  {#each post.tags.slice(0, 2) as tag}
                    <span class="badge badge-sm badge-outline">#{tag}</span>
                  {/each}
                </div>
              {/if}
              {#if readTime}
                <div class="text-xs opacity-60">{readTime}</div>
              {/if}
            </div>

            <span class="i-heroicons-outline-arrow-right w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </a>
        {/each}
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 py-8">
    <Footer />
  </div>
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

