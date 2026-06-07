<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'
  import type { AppEmbedMode } from '$lib/apps/registry'

  let {
    title = '',
    embedMode = 'contained' as AppEmbedMode,
    hideSiteChrome = false,
    children
  }: {
    title?: string
    embedMode?: AppEmbedMode
    /** When true, child is expected to manage full viewport (e.g. skill tree). */
    hideSiteChrome?: boolean
    children?: import('svelte').Snippet
  } = $props()

  onMount(() => {
    if (!browser || !hideSiteChrome) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  })

  onDestroy(() => {
    if (browser && hideSiteChrome) {
      document.body.style.overflow = ''
    }
  })
</script>

<svelte:head>
  {#if title}
    <title>{title}</title>
  {/if}
</svelte:head>

<div
  class="app-shell"
  class:app-shell--fullscreen={embedMode === 'fullscreen'}
  class:app-shell--hide-chrome={hideSiteChrome}
  data-embed-mode={embedMode}
>
  {@render children?.()}
</div>

<style>
  .app-shell {
    width: 100%;
    min-height: 0;
  }

  .app-shell--fullscreen {
    height: 100%;
    overflow: hidden;
  }

</style>
