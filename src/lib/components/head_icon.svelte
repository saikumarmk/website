<script lang="ts">
  import { dev } from '$app/environment'
  import { page } from '$app/state'
  import { favicon, any } from '$lib/config/icon'
  import { posts } from '$lib/stores/posts'
  import { ogImage } from '$lib/utils/og'

  const trim = (path: string) => path.replace(/\/+$/, '')
  // a post's tab shows its own flower; those are drawn after the build, so dev keeps the site icon
  let flower = $derived(dev ? undefined : $posts.find((p) => trim(p.path) === trim(page.url.pathname))?.path)
</script>

<svelte:head>
  {#if flower}
    <link rel="icon" href={ogImage(flower, '-32')} sizes="32x32" type="image/png" />
    <link rel="icon" href={ogImage(flower, '-16')} sizes="16x16" type="image/png" />
  {:else}
    {#if favicon}
      <link rel="shortcut icon" href={favicon.src} sizes={favicon.sizes} type={favicon.type} />
    {/if}
    {#if any['192']}
      <link rel="icon" href={any['192'].src} sizes={any['192'].sizes} type={any['192'].type} />
    {/if}
  {/if}
  {#if any['180']}
    <link rel="apple-touch-icon" href={any['180'].src} sizes={any['180'].sizes} type={any['180'].type} />
  {/if}
</svelte:head>
