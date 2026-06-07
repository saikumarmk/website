<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import FlexSearch from 'flexsearch'
  import { FLEXSEARCH_DOCUMENT_OPTIONS, STATIC_SEARCH_PAGES } from '$lib/search/flexsearch-config'
  
  let isOpen = $state(false)

  let searchQuery = $state('')
  let searchResults = $state<any[]>([])
  let selectedIndex = $state(0)
  let searchInput = $state<HTMLInputElement | undefined>(undefined)
  
  // FlexSearch index (must be $state so loading UI and $effect react after async load)
  let searchIndex: any = null
  let searchablePosts: any[] = []
  let indexLoading = $state(false)
  let indexLoaded = $state(false)
  
  const staticPages = STATIC_SEARCH_PAGES
  
  // Load and build search index (lazy, only when modal opens)
  async function loadSearchIndex() {
    if (indexLoaded || indexLoading) return
    
    indexLoading = true
    
    try {
      const response = await fetch('/search-index.json')
      const data = await response.json()

      // New format: { posts, serializedIndex }; legacy: plain array of posts
      searchablePosts = Array.isArray(data) ? data : (data.posts ?? [])

      searchIndex = new FlexSearch.Document(FLEXSEARCH_DOCUMENT_OPTIONS)

      const serialized = !Array.isArray(data) && data.serializedIndex
      if (Array.isArray(serialized) && serialized.length > 0) {
        for (const pair of serialized) {
          if (!Array.isArray(pair) || pair.length < 2) continue
          searchIndex.import(pair[0], pair[1])
        }
      } else {
        for (const post of searchablePosts) {
          searchIndex.add({
            ...post,
            tags: post.tags?.join(' ') || ''
          })
        }
        for (const page of staticPages) {
          searchIndex.add({
            ...page,
            tags: ''
          })
        }
      }

      indexLoaded = true
    } catch (error) {
      console.error('Failed to load search index:', error)
    } finally {
      indexLoading = false
    }
  }
  
  // Extract a snippet around the matched text
  function getContentSnippet(content: string, query: string): string | null {
    if (!content) return null
    
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const matchIndex = lowerContent.indexOf(lowerQuery)
    
    if (matchIndex === -1) return null
    
    // Get ~40 chars before and after the match
    const snippetStart = Math.max(0, matchIndex - 40)
    const snippetEnd = Math.min(content.length, matchIndex + query.length + 60)
    
    let snippet = content.slice(snippetStart, snippetEnd).trim()
    
    // Add ellipsis if truncated
    if (snippetStart > 0) snippet = '...' + snippet
    if (snippetEnd < content.length) snippet = snippet + '...'
    
    return snippet
  }
  
  // Highlight matched text in a string
  function highlightMatch(text: string, query: string): string {
    if (!text || !query) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="search-mark">$1</mark>')
  }

  function normalizeTags(doc: { tags?: string | string[] }) {
    const t = doc?.tags
    if (Array.isArray(t)) return t.filter(Boolean)
    if (typeof t === 'string') return t.split(/\s+/).filter(Boolean)
    return []
  }

  // Search function using FlexSearch
  function performSearch(query: string) {
    if (!query.trim() || !searchIndex) {
      searchResults = []
      return
    }

    let results: any[]
    try {
      const raw = searchIndex.search(query, {
        limit: 15,
        enrich: true
      }) as any
      results = Array.isArray(raw) ? raw : []
    } catch (e) {
      console.error('FlexSearch search failed:', e)
      searchResults = []
      return
    }

    const resultMap = new Map<string, { item: any; score: number; matchedFields: string[] }>()

    results.forEach((fieldResult: any) => {
      const fieldName = fieldResult.field ?? 'content'
      const fieldScore =
        fieldName === 'title' ? 100
        : fieldName === 'tags' ? 50
        : fieldName === 'summary' ? 30
        : 10

      const row = fieldResult.result
      if (!Array.isArray(row)) return

      row.forEach((match: any) => {
        const path = match.id
        const doc = match.doc
        if (!doc || path == null) return

        if (resultMap.has(path)) {
          const existing = resultMap.get(path)!
          existing.score += fieldScore
          if (!existing.matchedFields.includes(fieldName)) {
            existing.matchedFields.push(fieldName)
          }
        } else {
          const staticPage = staticPages.find(p => p.path === path)
          const fullPost = searchablePosts.find(p => p.path === path)

          resultMap.set(path, {
            item: {
              path: doc.path,
              title: doc.title,
              summary: doc.summary,
              tags: normalizeTags(doc),
              created: doc.created,
              isStatic: !!staticPage,
              content: fullPost?.content || ''
            },
            score: fieldScore + (staticPage ? 50 : 0),
            matchedFields: [fieldName]
          })
        }
      })
    })
    
    // Sort by score and convert to array, adding snippet if content matched
    searchResults = Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item, matchedFields }) => ({
        ...item,
        matchedInContent: matchedFields.includes('content') && !matchedFields.includes('title') && !matchedFields.includes('summary'),
        contentSnippet: matchedFields.includes('content') ? getContentSnippet(item.content, query) : null,
        query // Pass query for highlighting
      }))
    
    selectedIndex = 0
  }
  
  $effect(() => {
    if (indexLoaded) performSearch(searchQuery)
  })
  
  // Open/close handlers
  export function open() {
    isOpen = true
    if (browser) {
      document.body.style.overflow = 'hidden'
      loadSearchIndex() // Load index when modal opens
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
        scrollToSelected()
        break
      case 'ArrowUp':
        e.preventDefault()
        selectedIndex = Math.max(selectedIndex - 1, 0)
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
  
  // Global ⌘/Ctrl+K — use e.code (layout-independent); capture so we beat focused inputs / other handlers
  function handleGlobalKeydown(e: KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey)) return
    if (e.altKey || e.shiftKey) return
    const isK = e.code === 'KeyK' || e.key === 'k' || e.key === 'K'
    if (!isK) return
    e.preventDefault()
    e.stopPropagation()
    if (isOpen) {
      close()
    } else {
      open()
    }
  }

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleGlobalKeydown, true)
      return () => window.removeEventListener('keydown', handleGlobalKeydown, true)
    }
  })
</script>

{#if isOpen}
  <!-- Modal overlay -->
  <div
    class="search-overlay fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200"
    onclick={close}
    onkeydown={(e) => e.key === 'Enter' && close()}
    role="button"
    tabindex="0"
    aria-label="Close search">
    
    <!-- Search modal -->
    <div
      class="search-dialog w-full max-w-2xl rounded-lg shadow-2xl animate-in slide-in-from-top-4 duration-300"
      onclick={e => e.stopPropagation()}
      onkeydown={e => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title"
      tabindex="-1">
      
      <!-- Search input -->
      <div class="search-bar flex items-center gap-3 px-4 py-3 border-b">
        <span class="i-heroicons-outline-search w-5 h-5 opacity-50"></span>
        <input
          bind:this={searchInput}
          bind:value={searchQuery}
          onkeydown={handleInputKeydown}
          type="text"
          placeholder={indexLoading ? "Loading search..." : "Search posts..."}
          class="search-input flex-1 bg-transparent outline-none text-base"
          id="search-title"
          autocomplete="off"
          spellcheck="false"
          disabled={indexLoading} />
        <kbd class="search-kbd">ESC</kbd>
      </div>
      
      <!-- Search results -->
      <div class="search-results max-h-[60vh] overflow-y-auto">
        {#if indexLoading}
          <div class="px-4 py-8 text-center opacity-60">
            <span class="loading loading-spinner loading-md"></span>
            <p class="mt-2">Loading search…</p>
          </div>
        {:else if searchQuery && searchResults.length === 0}
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
                  onclick={close}
                  data-search-index={index}
                  class="search-result flex flex-col px-4 py-3 transition-colors cursor-pointer {index === selectedIndex ? 'selected' : ''}"
                  onmouseenter={() => selectedIndex = index}>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      {#if post.isStatic}
                        <span class="i-heroicons-outline-star w-4 h-4 opacity-50"></span>
                      {:else}
                        <span class="i-heroicons-outline-document-text w-4 h-4 opacity-50"></span>
                      {/if}
                      <span class="font-semibold">{post.title ?? post.path.slice(1)}</span>
                      {#if post.isStatic}
                        <span class="search-badge">Page</span>
                      {/if}
                    </div>
                    {#if index === selectedIndex}
                      <span class="i-heroicons-outline-arrow-right w-4 h-4 flex-shrink-0 mt-1"></span>
                    {/if}
                  </div>
                  {#if post.contentSnippet && post.matchedInContent}
                    <!-- Show content snippet when match is in body -->
                    <p class="text-sm opacity-70 mt-1 line-clamp-2 italic">
                      {@html highlightMatch(post.contentSnippet, post.query)}
                    </p>
                  {:else if post.summary}
                    <p class="text-sm opacity-70 mt-1 line-clamp-2">{post.summary}</p>
                  {/if}
                  {#if post.tags && post.tags.length > 0}
                    <div class="flex gap-2 mt-2 flex-wrap">
                      {#each post.tags.slice(0, 3) as tag}
                        <span class="search-tag">#{tag}</span>
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
            <p class="mb-1">Full-text search</p>
            <p class="text-sm">Search by title, tags, summary, or content</p>
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="search-footer px-4 py-3 border-t flex items-center justify-between text-xs">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <kbd class="search-kbd small">↑</kbd>
            <kbd class="search-kbd small">↓</kbd>
            Navigate
          </span>
          <span class="flex items-center gap-1">
            <kbd class="search-kbd small">↵</kbd>
            Select
          </span>
        </div>
        <span class="flex items-center gap-1">
          <kbd class="search-kbd small">ESC</kbd>
          Close
        </span>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :global(.search-mark) {
    background: hsl(var(--p) / 0.22);
    color: inherit;
    border-radius: 0.25rem;
    padding-inline: 0.125rem;
  }

  .search-overlay {
    background: rgb(0 0 0 / 0.62);
    backdrop-filter: blur(8px);
  }

  .search-dialog {
    border: 1px solid hsl(var(--bc) / 0.14);
    background: hsl(var(--b1));
    color: hsl(var(--bc));
    overflow: hidden;
  }

  .search-bar,
  .search-footer {
    border-color: hsl(var(--bc) / 0.12);
  }

  .search-footer {
    color: hsl(var(--bc) / 0.62);
  }

  .search-result:hover,
  .search-result.selected {
    background: hsl(var(--b2));
  }

  .search-kbd {
    border: 1px solid hsl(var(--bc) / 0.16);
    border-bottom-width: 2px;
    border-radius: 0.35rem;
    background: hsl(var(--b2));
    color: hsl(var(--bc) / 0.72);
    padding: 0.12rem 0.45rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    line-height: 1.2;
  }

  .search-kbd.small {
    font-size: 0.65rem;
    padding: 0.08rem 0.32rem;
  }

  .search-badge,
  .search-tag {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid hsl(var(--p) / 0.38);
    color: hsl(var(--p));
    font-size: 0.68rem;
    line-height: 1;
    padding: 0.15rem 0.45rem;
  }

  .search-badge {
    background: hsl(var(--p) / 0.14);
  }

  :global(html.site-editorial-root) .search-dialog {
    border-color: var(--site-line-strong);
    background: color-mix(in srgb, var(--site-panel) 94%, transparent);
    color: var(--site-fg);
    box-shadow: 0 24px 80px rgb(0 0 0 / 0.4);
  }

  :global(html.site-editorial-root) .search-bar,
  :global(html.site-editorial-root) .search-footer {
    border-color: var(--site-line);
  }

  :global(html.site-editorial-root) .search-footer {
    color: var(--site-muted);
  }

  :global(html.site-editorial-root) .search-result:hover,
  :global(html.site-editorial-root) .search-result.selected {
    background: var(--site-panel-2);
  }

  :global(html.site-editorial-root) .search-kbd {
    border-color: var(--site-line-strong);
    background: var(--site-panel-2);
    color: var(--site-muted);
  }

  :global(html.site-editorial-root) .search-badge,
  :global(html.site-editorial-root) .search-tag {
    border-color: color-mix(in srgb, var(--site-accent) 38%, transparent);
    color: var(--site-accent);
  }

  :global(html.site-editorial-root) .search-badge {
    background: color-mix(in srgb, var(--site-accent) 14%, transparent);
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
