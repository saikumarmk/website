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
  import ThreeCanvas from '$lib/components/three/astro_canvas.svelte'
  import '../app.pcss'
  import PokeCanvas from '$lib/components/three/poke_canvas.svelte'

  export let data: LayoutData

  let { res, path } = data

  $: if (data) path = data.path

  let currentMode = 'none'
  const unsubscribe = backgroundMode.subscribe(mode => (currentMode = mode))
  posts.set(res)
  tags.set(genTags(res))
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
  {#if currentMode === 'three'}
    <ThreeCanvas />
  {:else if currentMode === 'poke'}
    <PokeCanvas />
  {/if}
{/if}
<Head />

<!-- 3) then render all your UI -->
<Header {path} />

<Transition {path}>
  <slot />
</Transition>
