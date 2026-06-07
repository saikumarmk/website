<script lang="ts">
  import { head } from '$lib/config/general'
  import Icon from '$lib/components/head_icon.svelte'
</script>

<svelte:head>
  {#if head.me}
    {#each head.me as href}
      <link rel="me" {href} />
    {/each}
  {/if}
</svelte:head>

<Icon />
