<script lang="ts">
  import type { LayoutProps } from './$types'
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

  let { data, children }: LayoutProps = $props()

  let searchModal = $state<any>()
  let ThreeCanvas = $state<any>(null)
  let PokeCanvas = $state<any>(null)

  let res = $derived(data.res)
  let path = $derived(data.path)

  let currentMode = $state('none')
  $effect(() => {
    const unsub = backgroundMode.subscribe(mode => {
      currentMode = mode
    })
    return unsub
  })

  $effect(() => {
    if (browser && currentMode === 'three' && !ThreeCanvas) {
      import('$lib/components/three/astro_canvas.svelte').then(module => {
        ThreeCanvas = module.default
      })
    }
  })

  $effect(() => {
    if (browser && currentMode === 'poke' && !PokeCanvas) {
      import('$lib/components/three/poke_canvas.svelte').then(module => {
        PokeCanvas = module.default
      })
    }
  })

  $effect(() => {
    posts.set(data.res ?? [])
    tags.set(genTags(data.res ?? []))
  })

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

{#if currentMode === 'three' && ThreeCanvas}
  <ThreeCanvas />
{:else if currentMode === 'poke' && PokeCanvas}
  <PokeCanvas />
{/if}
<Head />

<!-- 3) then render all your UI -->
<Header {path} bind:searchModal />

<Transition {path}>
  {@render children()}
</Transition>

<CodeCopyButton />
<ImageLightbox />
<SearchModal bind:this={searchModal} />
