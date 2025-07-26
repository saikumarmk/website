<script lang="ts">
  import { fly } from 'svelte/transition'
  import { browser } from '$app/environment'
  import Card from '$lib/components/post_card.svelte'
  import Head from '$lib/components/head.svelte'
  import Toc from '$lib/components/post_toc.svelte'
  import Footer from '$lib/components/footer.svelte'
  export let post: Urara.Post
</script>

<Head {post} />

<div class="flex flex-col xl:flex-row justify-center">
  <!-- Post Section -->
  <div class="flex-1 w-full max-w-screen-3xl xl:order-first">
    <Card {post}>
      <slot />
    </Card>
    <Footer sticky={true} />
  </div>

  <!-- TOC Section -->
  <div
    in:fly={{ x: -25, duration: 300, delay: 500 }}
    out:fly={{ x: -25, duration: 300 }}
    class="hidden xl:block w-full max-w-sm xl:order-last ease-out transform xl:mr-0">
    {#if browser && post.toc}
      <div class="h-full">
        <Toc toc={post.toc} />
      </div>
    {/if}
  </div>
</div>
