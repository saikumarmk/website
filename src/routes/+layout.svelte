<script lang="ts">
  import type { LayoutProps } from './$types'
  import { onMount } from 'svelte'
  import { browser, dev } from '$app/environment'
  import { genTags } from '$lib/utils/post-meta'
  import { posts, tags } from '$lib/stores/posts'
  import { registerSW } from 'virtual:pwa-register'
  import Head from '$lib/components/head_static.svelte'
  import Header from '$lib/components/header.svelte'
  import Footer from '$lib/components/footer.svelte'
  import Transition from '$lib/components/transition.svelte'
  import '@fontsource-variable/newsreader/opsz.css'
  import '@fontsource-variable/newsreader/opsz-italic.css'
  import '@fontsource/ibm-plex-mono/400.css'
  import '@fontsource/ibm-plex-mono/500.css'
  import 'katex/dist/katex.min.css'
  import 'uno.css'
  import '../app.pcss'
  import '../styles/sampler.css'
  import CodeCopyButton from '$lib/components/code_copy_button.svelte'
  import ImageLightbox from '$lib/components/image_lightbox.svelte'
  import SearchModal from '$lib/components/search_modal.svelte'
  import Sky from '$lib/components/Sky.svelte'
  import HoverBloom from '$lib/components/HoverBloom.svelte'

  let { data, children }: LayoutProps = $props()

  let searchModal = $state<any>()

  let path = $derived(data.path)
  /** Full-screen apps get the masthead and the rest of the viewport, with no footer. */
  let isApp = $derived(/^\/growth\/2026\/?$/.test(path))

  // Set synchronously so post pages can render Nearby during SSR.
  const syncPosts = () => {
    posts.set(data.res ?? [])
    tags.set(genTags(data.res ?? []))
  }
  syncPosts()
  $effect(syncPosts)

  onMount(() => {
    if (dev || !browser || !('serviceWorker' in navigator)) return
    registerSW({
      immediate: true,
      onRegistered: r => r && setInterval(async () => await r.update(), 198964),
      onRegisterError: error => console.error(error)
    })
  })
</script>

<Head />

<div class="page" class:app-frame={isApp}>
  <a class="skip" href="#main">Skip to content</a>
  <Header onsearch={() => searchModal?.open()} />

  <main id="main" tabindex="-1">
    <Transition {path}>
      {@render children()}
    </Transition>
  </main>

  {#if !isApp}<Footer />{/if}
  {#if !isApp}<HoverBloom />{/if}
</div>

{#if !isApp}<Sky />{/if}
<CodeCopyButton />
<ImageLightbox />
<SearchModal bind:this={searchModal} />

<style>
  #main:focus {
    outline: none;
  }
  .app-frame {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    max-width: none;
    padding: 0 1.5rem;
  }
  .app-frame > #main {
    flex: 1;
    min-height: 0;
    margin-top: 1rem;
  }
  .app-frame > #main > :global(.layout-transition) {
    height: 100%;
  }
</style>
