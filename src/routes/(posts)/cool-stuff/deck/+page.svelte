<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  // a prerendered redirect can't carry a query string, so the handoff to `?present` happens here
  onMount(() => void goto('/cool-stuff?present', { replaceState: true }))
</script>

<svelte:head>
  <title>Opening the deck…</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="col">
  <p>
    Opening the deck… <a href="/cool-stuff/">or read it as an article</a>
    .
  </p>
</div>
