<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { browser } from '$app/environment'
  import Card from '$lib/components/post_card.svelte'
  import Head from '$lib/components/head.svelte'
  import Toc from '$lib/components/post_toc.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Breadcrumb from '$lib/components/breadcrumb.svelte'
  import { getSeriesInfo } from '$lib/utils/series'
  export let post: Urara.Post | null
  
  let katexLoaded = false
  
  $: seriesInfo = post ? getSeriesInfo(post) : undefined
  
  // Lazy load KaTeX CSS only if the post contains math
  onMount(() => {
    if (browser && !katexLoaded) {
      // Check if page has math elements (defer to next tick to let content render)
      setTimeout(() => {
        const hasMath = document.querySelector('.math, .katex')
        if (hasMath) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css'
          link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV'
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
          katexLoaded = true
        }
      }, 100)
    }
  })
</script>

<Head {post} />

<div class="flex flex-col xl:flex-row justify-center">
  <!-- Post Section -->
  <div class="flex-1 w-full max-w-screen-3xl xl:order-first">
    {#if post}
      <Card {post}>
        <svelte:fragment slot="breadcrumb">
          <Breadcrumb {post} series={seriesInfo?.series} currentPart={seriesInfo?.part} />
        </svelte:fragment>
        <slot />
      </Card>
    {/if}
    <Footer sticky={true} />
  </div>

  <!-- TOC Section -->
  <div
    in:fly={{ x: -25, duration: 300, delay: 500 }}
    out:fly={{ x: -25, duration: 300 }}
    class="hidden xl:block w-full max-w-sm xl:order-last ease-out transform xl:mr-0">
    {#if browser && post && post.toc}
      <div class="h-full">
        <Toc toc={post.toc} />
      </div>
    {/if}
  </div>
</div>
