<script lang="ts">
  import { onMount } from 'svelte'
  import { createAsciiFlower } from '$lib/thread/ascii-flower'

  let { class: klass = '' }: { class?: string } = $props()
  let canvas: HTMLCanvasElement

  onMount(() => {
    const flower = createAsciiFlower(canvas)
    return () => flower.destroy()
  })
</script>

<canvas bind:this={canvas} class={klass} aria-hidden="true"></canvas>
