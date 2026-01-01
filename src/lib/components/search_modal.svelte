<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { posts as storedPosts } from '$lib/stores/posts'
  import { goto } from '$app/navigation'
  
  export let isOpen = false
  
  let searchQuery = ''
  let searchResults: any[] = []
  let selectedIndex = 0
  let searchInput: HTMLInputElement
  
  let allPosts: Urara.Post[] = []
  
  // Static pages to include in search
  const staticPages = [
    { title: 'About', path: '/about', summary: 'Learn more about me', type: 'page' },
    { title: 'Portfolio', path: '/portfolio', summary: 'View my work and projects', type: 'page' },
    { title: 'Yggdrasil 2026', path: '/growth/2026', summary: 'Interactive skill tree and learning roadmap', type: 'page' },
    { title: 'Archive', path: '/archive', summary: 'Browse all posts by tag and year', type: 'page' },
  ]
  
  storedPosts.subscribe(posts => {
    if (Array.isArray(posts)) {
      allPosts = posts.filter(post => !post.flags?.includes('unlisted'))
    }
  })
  
  // Search function
  function performSearch(query: string) {
    if (!query.trim()) {
      searchResults = []
      return
    }
    
    const lowerQuery = query.toLowerCase()
    
    // Search static pages
    const staticResults = staticPages
      .map(page => {
        let score = 0
        if (page.title.toLowerCase().includes(lowerQuery)) score += 150 // Higher priority
        if (page.summary.toLowerCase().includes(lowerQuery)) score += 50
        return { item: { ...page, isStatic: true }, score }
      })
      .filter(({ score }) => score > 0)
    
    // Search posts
    const postResults = allPosts
      .map(post => {
        let score = 0
        
        // Title match (highest priority)
        if (post.title?.toLowerCase().includes(lowerQuery)) {
          score += 100
        }
        
        // Tags match
        if (post.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          score += 50
        }
        
        // Summary match
        if (post.summary?.toLowerCase().includes(lowerQuery)) {
          score += 30
        }
        
        // Content match (lowest priority)
        if (post.html?.toLowerCase().includes(lowerQuery)) {
          score += 10
        }
        
        return { item: post, score }
      })
      .filter(({ score }) => score > 0)
    
    // Combine and sort
    searchResults = [...staticResults, ...postResults]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item)
    
    selectedIndex = 0
  }
  
  // Reactive search
  $: performSearch(searchQuery)
  
  // Open/close handlers
  export function open() {
    isOpen = true
    if (browser) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => searchInput?.focus(), 100)
    }
  }
  
  export function close() {
    isOpen = false
    searchQuery = ''
    searchResults = []
    selectedIndex = 0
    if (browser) {
      document.body.style.overflow = ''
    }
  }
  
  // Keyboard navigation for the search input
  function handleInputKeydown(e: KeyboardEvent) {
    if (!isOpen) return
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        selectedIndex = Math.min(selectedIndex + 1, searchResults.length - 1)
        // Scroll selected item into view
        scrollToSelected()
        break
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex = Math.max(selectedIndex - 1, 0)
        // Scroll selected item into view
        scrollToSelected()
        break
      case 'Enter':
        e.preventDefault()
        if (searchResults[selectedIndex]) {
          goto(searchResults[selectedIndex].path)
          close()
        }
        break
    }
  }
  
  function scrollToSelected() {
    if (browser) {
      const selected = document.querySelector(`[data-search-index="${selectedIndex}"]`)
      if (selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }
  
  // Global Ctrl+K handler
  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      if (isOpen) {
        close()
      } else {
        open()
      }
    }
  }
  
  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleGlobalKeydown)
      return () => window.removeEventListener('keydown', handleGlobalKeydown)
    }
  })
</script>

{#if isOpen}
  <!-- Modal overlay -->
  <div
    class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200"
    on:click={close}
    on:keydown={(e) => e.key === 'Enter' && close()}
    role="button"
    tabindex="0"
    aria-label="Close search">
    
    <!-- Search modal -->
    <div
      class="w-full max-w-2xl bg-base-100 rounded-lg shadow-2xl animate-in slide-in-from-top-4 duration-300"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title">
      
      <!-- Search input -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-base-content/10">
        <span class="i-heroicons-outline-search w-5 h-5 opacity-50"></span>
        <input
          bind:this={searchInput}
          bind:value={searchQuery}
          on:keydown={handleInputKeydown}
          type="text"
          placeholder="Search posts..."
          class="flex-1 bg-transparent outline-none text-base"
          id="search-title"
          autocomplete="off"
          spellcheck="false" />
        <kbd class="kbd kbd-sm">ESC</kbd>
      </div>
      
      <!-- Search results -->
      <div class="max-h-[60vh] overflow-y-auto">
        {#if searchQuery && searchResults.length === 0}
          <div class="px-4 py-8 text-center opacity-60">
            <span class="i-heroicons-outline-document-search w-12 h-12 mx-auto mb-2"></span>
            <p>No results found for "{searchQuery}"</p>
          </div>
        {:else if searchResults.length > 0}
          <ul class="py-2">
            {#each searchResults as post, index}
              <li>
                <a
                  href={post.path}
                  on:click={close}
                  data-search-index={index}
                  class="flex flex-col px-4 py-3 hover:bg-base-200 transition-colors cursor-pointer {index === selectedIndex ? 'bg-base-200' : ''}"
                  on:mouseenter={() => selectedIndex = index}>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      {#if post.isStatic}
                        <span class="i-heroicons-outline-star w-4 h-4 opacity-50"></span>
                      {:else}
                        <span class="i-heroicons-outline-document-text w-4 h-4 opacity-50"></span>
                      {/if}
                      <span class="font-semibold">{post.title ?? post.path.slice(1)}</span>
                      {#if post.isStatic}
                        <span class="badge badge-xs badge-primary">Page</span>
                      {/if}
                    </div>
                    {#if index === selectedIndex}
                      <span class="i-heroicons-outline-arrow-right w-4 h-4 flex-shrink-0 mt-1"></span>
                    {/if}
                  </div>
                  {#if post.summary}
                    <p class="text-sm opacity-70 mt-1 line-clamp-2">{post.summary}</p>
                  {/if}
                  {#if post.tags && post.tags.length > 0}
                    <div class="flex gap-2 mt-2 flex-wrap">
                      {#each post.tags.slice(0, 3) as tag}
                        <span class="badge badge-xs badge-outline">#{tag}</span>
                      {/each}
                    </div>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="px-4 py-8 text-center opacity-60">
            <span class="i-heroicons-outline-search-circle w-12 h-12 mx-auto mb-2"></span>
            <p class="mb-1">Quick search</p>
            <p class="text-sm">Start typing to search posts by title, tags, or content</p>
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="px-4 py-3 border-t border-base-content/10 flex items-center justify-between text-xs opacity-60">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="kbd kbd-xs">↑</kbd>
            <kbd class="kbd kbd-xs">↓</kbd>
            Navigate
          </span>
          <span class="flex items-center gap-1">
            <kbd class="kbd kbd-xs">↵</kbd>
            Select
          </span>
        </div>
        <span class="flex items-center gap-1">
          <kbd class="kbd kbd-xs">ESC</kbd>
          Close
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .fade-in {
    animation: fadeIn 0.2s ease;
  }
  
  .slide-in-from-top-4 {
    animation: slideInFromTop 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideInFromTop {
    from {
      transform: translateY(-1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>

