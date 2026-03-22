<script lang="ts">
  import { page } from '$app/stores'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  let {
    post = undefined,
    series = undefined,
    currentPart = undefined
  }: {
    post?: Urara.Post
    series?: { name: string; parts: { title: string; slug: string; part: number }[] }
    currentPart?: number
  } = $props()

  let path = $state('')

  $effect.pre(() => {
    if (post?.path != null && post.path !== '') path = post.path
  })

  let shouldRender = $derived(Boolean(path || post))

  onMount(() => {
    if (browser) {
      const unsubscribe = page.subscribe($page => {
        path = $page.url.pathname
      })
      return unsubscribe
    }
  })

  let pathSegments = $derived(path.split('/').filter(Boolean))

  let prevPost = $state<{ title: string; slug: string; part: number } | undefined>(undefined)
  let nextPost = $state<{ title: string; slug: string; part: number } | undefined>(undefined)

  $effect(() => {
    if (series && currentPart !== undefined) {
      const sortedParts = [...series.parts].sort((a, b) => a.part - b.part)
      const currentIndex = sortedParts.findIndex(p => p.part === currentPart)
      prevPost = currentIndex > 0 ? sortedParts[currentIndex - 1] : undefined
      nextPost = currentIndex < sortedParts.length - 1 ? sortedParts[currentIndex + 1] : undefined
    } else {
      prevPost = undefined
      nextPost = undefined
    }
  })
</script>

{#if shouldRender}
{#if series && currentPart !== undefined}
  <!-- Series navigation -->
  <div class="flex items-center justify-between flex-wrap gap-3 text-sm mb-0 mt-4 px-4 md:px-8 pb-4 border-b border-base-content/10">
    <div class="flex items-center gap-2 opacity-60">
      <a href="/" class="hover:opacity-100 transition-opacity" title="Home">
        <span class="i-heroicons-outline-home w-4 h-4" />
      </a>
      <span class="opacity-40">/</span>
      <span class="hidden sm:inline font-medium">{series.name}</span>
      <span class="sm:hidden font-medium">Playbook</span>
      <span class="opacity-40">/</span>
      <span class="font-semibold text-primary">
        {#if currentPart === 0}
          FAQ
        {:else}
          Part {currentPart}
        {/if}
      </span>
    </div>
    <div class="flex items-center gap-1">
      {#if prevPost}
        <a 
          href="/{prevPost.slug}" 
          class="btn btn-sm btn-ghost gap-1 normal-case h-8 min-h-0 px-3 hover:bg-base-200"
          title="Previous: {prevPost.title}">
          <span class="i-heroicons-outline-chevron-left w-4 h-4" />
          <span class="hidden md:inline">Previous</span>
        </a>
      {:else}
        <button class="btn btn-sm btn-ghost gap-1 normal-case h-8 min-h-0 px-3 opacity-30 cursor-not-allowed" disabled>
          <span class="i-heroicons-outline-chevron-left w-4 h-4" />
          <span class="hidden md:inline">Previous</span>
        </button>
      {/if}
      {#if nextPost}
        <a 
          href="/{nextPost.slug}" 
          class="btn btn-sm btn-ghost gap-1 normal-case h-8 min-h-0 px-3 hover:bg-base-200"
          title="Next: {nextPost.title}">
          <span class="hidden md:inline">Next</span>
          <span class="i-heroicons-outline-chevron-right w-4 h-4" />
        </a>
      {:else}
        <button class="btn btn-sm btn-ghost gap-1 normal-case h-8 min-h-0 px-3 opacity-30 cursor-not-allowed" disabled>
          <span class="hidden md:inline">Next</span>
          <span class="i-heroicons-outline-chevron-right w-4 h-4" />
        </button>
      {/if}
    </div>
  </div>
{:else}
  <!-- Simple breadcrumb -->
  <div class="flex items-center gap-2 text-sm mb-0 mt-4 px-4 md:px-8 pb-3 border-b border-base-content/10">
    <a href="/" class="hover:text-primary transition-colors opacity-60 hover:opacity-100" title="Home">
      <span class="i-heroicons-outline-home w-4 h-4" />
    </a>
    {#each pathSegments as segment, i}
      <span class="opacity-30">/</span>
      {#if i < pathSegments.length - 1}
        <a 
          href="/{pathSegments.slice(0, i + 1).join('/')}" 
          class="hover:text-primary transition-colors opacity-60 hover:opacity-100 capitalize">
          {segment.replace(/-/g, ' ')}
        </a>
      {:else}
        <span class="capitalize font-medium">{segment.replace(/-/g, ' ')}</span>
      {/if}
    {/each}
  </div>
{/if}
{/if}
