<!--
  An ASCII particle field on a canvas ($lib/plates/field). Client-only: SSR renders an empty canvas.
  Pauses offscreen and in hidden tabs; with reduced motion it draws one settled frame and waits for play.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { createField, type Field, type FieldOptions } from '$lib/plates/field'
  import type { Plate } from '$lib/plates'

  let {
    mode = 'attractors',
    plate,
    running = $bindable(true),
    label = '',
    describedby,
    class: klass = '',
    ...opts
  }: Omit<FieldOptions, 'mode' | 'plate'> & {
    mode?: FieldOptions['mode']
    plate?: Plate
    running?: boolean
    /** set for a meaningful figure; otherwise the canvas is hidden from assistive tech */
    label?: string
    describedby?: string
    class?: string
  } = $props()

  let canvas: HTMLCanvasElement
  let field = $state<Field>()

  onMount(() => {
    const f = createField(canvas, { ...opts, mode, plate })
    running = f.running
    field = f
    return () => f.destroy()
  })

  $effect(() => field?.setRunning(running))
  $effect(() => {
    if (plate) field?.setPlate(plate)
  })
</script>

<canvas
  bind:this={canvas}
  class={klass}
  role={label || describedby ? 'img' : undefined}
  aria-label={label || undefined}
  aria-describedby={describedby}
  aria-hidden={label || describedby ? undefined : 'true'}>
</canvas>
