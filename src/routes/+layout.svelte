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
  import newsreaderLatin from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2?url'
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

  let searchModal = $state<ReturnType<typeof SearchModal>>()

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
    let registration: ServiceWorkerRegistration | undefined
    const checkForUpdate = () => {
      if (!registration || !navigator.onLine || document.visibilityState === 'hidden') return
      void registration.update().catch(error => console.error('Service worker update failed:', error))
    }
    registerSW({
      immediate: true,
      onRegisteredSW: (_url, r) => {
        registration = r
        checkForUpdate()
      },
      onRegisterError: error => console.error(error)
    })
    const interval = setInterval(checkForUpdate, 5 * 60 * 1000)
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('online', checkForUpdate)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('online', checkForUpdate)
    }
  })
</script>

<svelte:head>
  <link rel="preload" href={newsreaderLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

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
