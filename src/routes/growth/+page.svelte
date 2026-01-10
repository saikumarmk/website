<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/growth/2026', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Yggdrasil - Growth Tree</title>
  <meta http-equiv="refresh" content="0; url=/growth/2026" />
</svelte:head>

<!-- Fallback if JS disabled -->
<div class="container mx-auto px-4 py-8 text-center">
  <p>Redirecting to <a href="/growth/2026" class="link link-primary">Yggdrasil 2026</a>...</p>
</div>




