<script lang="ts">
  import { posts as storedPosts, tags as storedTags } from '$lib/stores/posts'
  import { title as storedTitle } from '$lib/stores/title'
  import { fade } from 'svelte/transition'
  import { getReadingTime } from '$lib/utils/reading-time'
  import Head from '$lib/components/head.svelte'

  storedTitle.set('Archive')

  let allPosts: Urara.Post[] = []
  let allTags: string[] = []
  let selectedTag: string | null = null
  let searchQuery = ''

  storedPosts.subscribe(posts => {
    if (Array.isArray(posts)) {
      allPosts = posts.filter(post => !post.flags?.includes('unlisted'))
    }
  })

  storedTags.subscribe(tags => {
    if (Array.isArray(tags)) {
      allTags = tags as string[]
    }
  })

  // Filter posts
  $: filteredPosts = allPosts.filter(post => {
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag)
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTag && matchesSearch
  })

  // Separate learning notes from blog posts
  $: learningNotes = filteredPosts.filter(post => 
    post.path?.startsWith('/growth/2026/') || 
    post.tags?.includes('yggdrasil') ||
    post.tags?.includes('learning-note')
  )
  
  $: blogPosts = filteredPosts.filter(post => 
    !post.path?.startsWith('/growth/2026/') && 
    !post.tags?.includes('yggdrasil') &&
    !post.tags?.includes('learning-note')
  )

  // Group blog posts by year
  $: postsByYear = blogPosts.reduce((acc, post) => {
    const year = new Date(post.published ?? post.created).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {} as Record<number, Urara.Post[]>)

  $: years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a))

  // Count posts per tag
  $: tagCounts = allPosts.reduce((acc, post) => {
    post.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  $: sortedTags = allTags.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0))
</script>

<Head />

<div class="container mx-auto px-4 py-20 max-w-7xl">
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-5xl font-bold mb-4">Archive</h1>
    <p class="text-lg opacity-70">Browse all posts by tag, year, or search</p>
  </div>

  <div class="grid lg:grid-cols-4 gap-8">
    <!-- Sidebar: Tags & Search -->
    <div class="lg:col-span-1 space-y-6">
      <!-- Search -->
      <div class="card bg-base-200 p-6 sticky top-24">
        <h2 class="text-xl font-bold mb-4">Search</h2>
        <div class="form-control">
          <div class="input-group">
            <span class="bg-base-300">
              <span class="i-heroicons-outline-magnifying-glass w-5 h-5"></span>
            </span>
            <input
              type="text"
              placeholder="Search posts..."
              class="input input-bordered w-full"
              bind:value={searchQuery}
            />
          </div>
        </div>

        {#if selectedTag || searchQuery}
          <button
            on:click={() => { selectedTag = null; searchQuery = '' }}
            class="btn btn-sm btn-ghost w-full mt-4">
            <span class="i-heroicons-outline-x-mark w-4 h-4 mr-2"></span>
            Clear filters
          </button>
        {/if}

        <!-- Tags -->
        <div class="divider my-6"></div>
        <h2 class="text-xl font-bold mb-4">Tags</h2>
        <div class="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {#each sortedTags as tag}
            <button
              on:click={() => selectedTag = selectedTag === tag ? null : tag}
              class="btn btn-sm justify-between"
              class:btn-primary={selectedTag === tag}
              class:btn-ghost={selectedTag !== tag}>
              <span>#{tag}</span>
              <span class="badge badge-sm">{tagCounts[tag]}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Main Content: Posts List -->
    <div class="lg:col-span-3">
      <!-- Stats -->
      <div class="stats stats-vertical lg:stats-horizontal shadow-lg w-full mb-8">
        <div class="stat">
          <div class="stat-title">Total Posts</div>
          <div class="stat-value text-primary">{allPosts.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Filtered</div>
          <div class="stat-value text-secondary">{filteredPosts.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Tags</div>
          <div class="stat-value">{allTags.length}</div>
        </div>
      </div>

      <!-- Filter status -->
      {#if selectedTag || searchQuery}
        <div class="alert alert-info mb-6">
          <span class="i-heroicons-outline-information-circle w-5 h-5"></span>
          <div>
            <div class="font-bold">Active Filters</div>
            <div class="text-sm">
              {#if selectedTag}Tag: <span class="badge badge-sm">#{selectedTag}</span>{/if}
              {#if searchQuery}Search: "{searchQuery}"{/if}
            </div>
          </div>
        </div>
      {/if}

      <!-- Posts by Category -->
      {#if filteredPosts.length === 0}
        <div class="card bg-base-200 shadow-lg p-12 text-center">
          <span class="i-heroicons-outline-document-magnifying-glass w-16 h-16 mx-auto mb-4 opacity-30"></span>
          <h3 class="text-2xl font-bold mb-2">No posts found</h3>
          <p class="opacity-70">Try adjusting your filters</p>
        </div>
      {:else}
        <div class="space-y-16">
          
          <!-- Learning Notes Section (Yggdrasil) -->
          {#if learningNotes.length > 0}
            <div in:fade={{ duration: 300 }}>
              <div class="flex items-center gap-4 mb-6">
                <span class="i-heroicons-outline-academic-cap w-8 h-8 text-accent"></span>
                <h2 class="text-3xl font-bold text-accent">Learning Notes</h2>
                <div class="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent"></div>
                <a href="/growth/2026" class="btn btn-sm btn-ghost gap-2">
                  <span class="i-heroicons-outline-map w-4 h-4"></span>
                  View Tree
                </a>
              </div>
              <p class="text-sm opacity-70 mb-6 px-1">
                Skill tree nodes from Yggdrasil 2026 - tracking my learning journey through AI, systems, and software engineering.
              </p>
              <div class="space-y-4">
                {#each learningNotes as post}
                  {@const readTime = getReadingTime(post.html)}
                  <a
                    href={post.path}
                    class="card bg-base-200 hover:bg-base-300 hover:shadow-xl transition-all p-6 flex flex-row items-start gap-4 group border-l-4 border-accent">
                    <!-- Date -->
                    <div class="flex flex-col items-center text-center min-w-[80px]">
                      <div class="text-2xl font-bold">
                        {new Date(post.published ?? post.created).getDate()}
                      </div>
                      <div class="text-xs opacity-60 uppercase">
                        {new Date(post.published ?? post.created).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <h3 class="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                        {post.title || post.path.slice(1)}
                      </h3>
                      {#if post.summary}
                        <p class="text-sm opacity-70 mb-3 line-clamp-2">{post.summary}</p>
                      {/if}
                      <div class="flex items-center gap-3 flex-wrap">
                        {#if post.tags && post.tags.length > 0}
                          <div class="flex gap-1 flex-wrap">
                            {#each post.tags as tag}
                              <span 
                                class="badge badge-sm"
                                class:badge-accent={tag === selectedTag}
                                class:badge-outline={tag !== selectedTag}>
                                #{tag}
                              </span>
                            {/each}
                          </div>
                        {/if}
                        {#if readTime}
                          <div class="text-xs opacity-60 flex items-center gap-1 ml-auto">
                            <span class="i-heroicons-outline-clock w-3 h-3"></span>
                            {readTime}
                          </div>
                        {/if}
                      </div>
                    </div>

                    <!-- Arrow -->
                    <span class="i-heroicons-outline-arrow-right w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></span>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Blog Posts Section -->
          {#if blogPosts.length > 0}
            <div in:fade={{ duration: 300 }}>
              <div class="flex items-center gap-4 mb-6">
                <span class="i-heroicons-outline-document-text w-8 h-8 text-primary"></span>
                <h2 class="text-3xl font-bold text-primary">Blog Posts</h2>
                <div class="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              <div class="space-y-12">
                {#each years as year}
            <div in:fade={{ duration: 300 }}>
              <!-- Year Header -->
              <div class="flex items-center gap-4 mb-6">
                <h2 class="text-3xl font-bold text-primary">{year}</h2>
                <div class="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
                <span class="text-sm opacity-60">
                  {postsByYear[Number(year)].length} post{postsByYear[Number(year)].length !== 1 ? 's' : ''}
                </span>
              </div>

              <!-- Posts -->
              <div class="space-y-4">
                {#each postsByYear[Number(year)] as post}
                  {@const readTime = getReadingTime(post.html)}
                  <a
                    href={post.path}
                    class="card bg-base-200 hover:bg-base-300 hover:shadow-xl transition-all p-6 flex flex-row items-start gap-4 group">
                    <!-- Date -->
                    <div class="flex flex-col items-center text-center min-w-[80px]">
                      <div class="text-2xl font-bold">
                        {new Date(post.published ?? post.created).getDate()}
                      </div>
                      <div class="text-xs opacity-60 uppercase">
                        {new Date(post.published ?? post.created).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {post.title || post.path.slice(1)}
                      </h3>
                      {#if post.summary}
                        <p class="text-sm opacity-70 mb-3 line-clamp-2">{post.summary}</p>
                      {/if}
                      <div class="flex items-center gap-3 flex-wrap">
                        {#if post.tags && post.tags.length > 0}
                          <div class="flex gap-1 flex-wrap">
                            {#each post.tags as tag}
                              <span 
                                class="badge badge-sm"
                                class:badge-primary={tag === selectedTag}
                                class:badge-outline={tag !== selectedTag}>
                                #{tag}
                              </span>
                            {/each}
                          </div>
                        {/if}
                        {#if readTime}
                          <div class="text-xs opacity-60 flex items-center gap-1 ml-auto">
                            <span class="i-heroicons-outline-clock w-3 h-3"></span>
                            {readTime}
                          </div>
                        {/if}
                      </div>
                    </div>

                    <!-- Arrow -->
                    <span class="i-heroicons-outline-arrow-right w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></span>
                  </a>
                {/each}
                </div>
              </div>
            {/each}
              </div>
            </div>
          {/if}
          
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

