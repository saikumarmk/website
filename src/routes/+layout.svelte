<script lang="ts">
  import type { LayoutData } from './$types'
  import { onMount } from 'svelte'
  import { browser, dev } from '$app/environment'
  import { genTags } from '$lib/utils/posts'
  import { posts, tags } from '$lib/stores/posts'
  import { registerSW } from 'virtual:pwa-register'
  import Head from '$lib/components/head_static.svelte'
  import Header from '$lib/components/header.svelte'
  import Transition from '$lib/components/transition.svelte'
  import { backgroundMode } from '$lib/stores/background'
  import 'uno.css'
  import '../app.pcss'
  import CodeCopyButton from '$lib/components/code_copy_button.svelte'
  import ImageLightbox from '$lib/components/image_lightbox.svelte'
  import SearchModal from '$lib/components/search_modal.svelte'

  export let data: LayoutData
  
  let searchModal: any
  let ThreeCanvas: any = null
  let PokeCanvas: any = null

  let { res, path } = data

  $: if (data) path = data.path

  let currentMode = 'none'
  const unsubscribe = backgroundMode.subscribe(mode => (currentMode = mode))
  
  // Dynamically load canvas components when needed
  $: if (browser && currentMode === 'three' && !ThreeCanvas) {
    import('$lib/components/three/astro_canvas.svelte').then(module => {
      ThreeCanvas = module.default
    })
  }
  
  $: if (browser && currentMode === 'poke' && !PokeCanvas) {
    import('$lib/components/three/poke_canvas.svelte').then(module => {
      PokeCanvas = module.default
    })
  }
  
  posts.set(res || [])
  tags.set(genTags(res || []))
  onMount(
    () =>
      !dev &&
      browser &&
      registerSW({
        immediate: true,
        onRegistered: r => r && setInterval(async () => await r.update(), 198964),
        onRegisterError: error => console.error(error)
      })
  )
</script>

{#if !/monash-graph-(2d|3d)/.test(path)}
  {#if currentMode === 'three' && ThreeCanvas}
    <svelte:component this={ThreeCanvas} />
  {:else if currentMode === 'poke' && PokeCanvas}
    <svelte:component this={PokeCanvas} />
  {/if}
{/if}
<Head />

<!-- 3) then render all your UI -->
<Header {path} bind:searchModal />

<Transition {path}>
  <slot />
</Transition>

<CodeCopyButton />
<ImageLightbox />
<SearchModal bind:this={searchModal} />
