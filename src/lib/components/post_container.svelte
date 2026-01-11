<script lang="ts">
  import { fly } from 'svelte/transition'
  import { browser } from '$app/environment'
  import Card from '$lib/components/post_card.svelte'
  import Head from '$lib/components/head.svelte'
  import Toc from '$lib/components/post_toc.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Breadcrumb from '$lib/components/breadcrumb.svelte'
  import { getSeriesInfo } from '$lib/utils/series'
  export let post: Urara.Post | null
  
  $: seriesInfo = post ? getSeriesInfo(post) : undefined
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
