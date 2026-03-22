<script lang="ts">
  import { fly } from 'svelte/transition'
  import { onMount, onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import Card from '$lib/components/post_card.svelte'
  import Head from '$lib/components/head.svelte'
  import Toc from '$lib/components/post_toc.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Breadcrumb from '$lib/components/breadcrumb.svelte'
  import { getSeriesInfo } from '$lib/utils/series'
  export let post: Urara.Post | null

  $: seriesInfo = post ? getSeriesInfo(post) : undefined

  /** Fullscreen deck — only on client (`$page` is unavailable during genPosts SSR). */
  let deckPresentation = false

  function syncDeckPresentation() {
    if (!browser || !post) {
      deckPresentation = false
      return
    }
    const slides = !!(post as { slides?: boolean }).slides
    try {
      deckPresentation = slides && get(page).url.searchParams.get('mode') === 'slides'
    } catch {
      deckPresentation = false
    }
    if (deckPresentation) document.body.classList.add('deck-presentation-active')
    else document.body.classList.remove('deck-presentation-active')
  }

  onMount(() => {
    syncDeckPresentation()
    const unsub = page.subscribe(() => syncDeckPresentation())
    return () => {
      unsub()
      document.body.classList.remove('deck-presentation-active')
    }
  })

  onDestroy(() => {
    if (browser) document.body.classList.remove('deck-presentation-active')
  })
</script>

<Head {post} />

<div
  class="flex flex-col xl:flex-row justify-center"
  class:deck-presentation-shell={deckPresentation}>
  <!-- Post Section -->
  <div
    class="flex flex-1 flex-col min-h-screen w-full max-w-screen-3xl xl:order-first"
    class:!max-w-none={deckPresentation}>
    {#if post}
      <div class="flex-1 w-full min-h-0">
        <Card {post} {deckPresentation}>
          <svelte:fragment slot="breadcrumb">
            {#if !deckPresentation}
              <Breadcrumb {post} series={seriesInfo?.series} currentPart={seriesInfo?.part} />
            {/if}
          </svelte:fragment>
          <slot />
        </Card>
      </div>
    {/if}
    {#if !deckPresentation}
      <Footer />
    {/if}
  </div>

  <!-- TOC Section -->
  {#if !deckPresentation}
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
  {/if}
</div>
