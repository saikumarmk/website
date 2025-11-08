<script lang="ts">
  import { posts as storedPosts } from '$lib/stores/posts'
  import { getReadingTime } from '$lib/utils/reading-time'
  
  export let currentPost: Urara.Post
  export let maxPosts: number = 3
  
  let relatedPosts: Urara.Post[] = []
  let allPosts: Urara.Post[] = []
  
  // Subscribe to posts store
  storedPosts.subscribe(posts => {
    if (Array.isArray(posts)) {
      allPosts = posts
    }
  })
  
  // Calculate relevance score based on shared tags
  function calculateRelevance(post: Urara.Post): number {
    if (!currentPost.tags || !post.tags) return 0
    
    const sharedTags = currentPost.tags.filter(tag => post.tags?.includes(tag))
    return sharedTags.length
  }
  
  // Get related posts reactively
  $: {
    // Filter out current post and unlisted posts
    const eligiblePosts = allPosts.filter(
      post => 
        post.path !== currentPost.path && 
        !post.flags?.includes('unlisted')
    )
    
    // Sort by relevance (shared tags), then by date
    const sorted = eligiblePosts
      .map(post => ({ post, relevance: calculateRelevance(post) }))
      .filter(({ relevance }) => relevance > 0) // Only posts with at least one shared tag
      .sort((a, b) => {
        if (a.relevance !== b.relevance) {
          return b.relevance - a.relevance
        }
        // If same relevance, prefer newer posts
        const dateA = new Date(a.post.published ?? a.post.created).getTime()
        const dateB = new Date(b.post.published ?? b.post.created).getTime()
        return dateB - dateA
      })
      .map(({ post }) => post)
    
    relatedPosts = sorted.slice(0, maxPosts)
  }
</script>

{#if relatedPosts.length > 0}
  <div class="mt-8 pt-8 border-t border-base-content/10">
    <h2 class="text-2xl font-bold mb-4">Related Posts</h2>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each relatedPosts as post}
        <a 
          href={post.path}
          class="card bg-base-200 hover:bg-base-300 transition-all duration-300 hover:shadow-lg group">
          <div class="card-body p-4">
            <h3 class="card-title text-base group-hover:text-primary transition-colors">
              {post.title ?? post.path.slice(1)}
            </h3>
            {#if post.summary}
              <p class="text-sm opacity-70 line-clamp-2">
                {post.summary}
              </p>
            {/if}
            <div class="flex flex-wrap gap-2 mt-2">
              {#if post.tags}
                {#each post.tags.slice(0, 3) as tag}
                  <span class="badge badge-sm badge-outline">#{tag}</span>
                {/each}
              {/if}
            </div>
            {#if post.html}
              {@const readTime = getReadingTime(post.html)}
              {#if readTime}
                <div class="text-xs opacity-60 mt-2 flex items-center gap-1">
                  <span class="i-heroicons-outline-clock w-3 h-3"></span>
                  {readTime}
                </div>
              {/if}
            {/if}
          </div>
        </a>
      {/each}
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
</style>

