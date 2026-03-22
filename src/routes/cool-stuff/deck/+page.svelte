<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { browser } from '$app/environment'

  /** Static deploy cannot emit paths with `?` in filenames; deck mode uses query on the client only. */
  onMount(() => {
    if (browser) void goto('/cool-stuff?mode=slides', { replaceState: true })
  })
</script>

<svelte:head>
  <title>Opening deck…</title>
</svelte:head>

<p class="urara-prose prose p-4">Opening presentation…</p>

<noscript>
  <p>
    Fullscreen slides need JavaScript. <a href="/cool-stuff/">Back to the article</a>
  </p>
</noscript>
