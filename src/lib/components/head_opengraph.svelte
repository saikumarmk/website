<script lang="ts">
  import { site } from '$lib/config/site'
  import { ogImage, siteOgImage } from '$lib/utils/og'
  let { post = undefined, page = undefined } = $props()

  let image = $derived(site.protocol + site.domain + (post ? (post.image ?? ogImage(post.path)) : siteOgImage))
</script>

<svelte:head>
  <meta property="og:site_name" content={site.title} />
  <meta property="og:locale" content={site.lang} />
  <meta property="og:image" content={image} />
  {#if !post?.image}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  <meta name="twitter:card" content="summary_large_image" />
  {#if post}
    <meta property="og:type" content="article" />
    <meta property="og:title" content={post.title ?? post.summary ?? post.path.slice(1)} />
    {#if post.summary}
      <meta property="og:description" content={post.summary} />
    {/if}
    {#if post.tags}
      {#each post.tags as tag}
        <meta property="article:tag" content={tag} />
      {/each}
    {/if}
    <meta property="og:url" content={site.protocol + site.domain + post.path} />
    <meta property="article:author" content={site.author.name} />
    <meta property="article:published_time" content={post.published ?? post.created} />
    <meta property="article:modified_time" content={post.updated ?? post.published ?? post.created} />
  {:else}
    <meta property="og:type" content="website" />
    <meta property="og:description" content={site.description} />
    {#if page}
      <meta property="og:title" content={page.title ?? page.path.slice(1)} />
      <meta property="og:url" content={site.protocol + site.domain + page.path} />
    {:else}
      <meta property="og:title" content={site.title} />
      <meta property="og:url" content={site.protocol + site.domain} />
    {/if}
  {/if}
</svelte:head>
