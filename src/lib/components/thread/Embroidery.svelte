<script lang="ts" generics="T">
  import { render, sew, type Compose } from '$lib/thread'

  let {
    compose,
    width = 200,
    height = 200,
    speed = 1,
    manual = false,
    palette = 'ado',
    label = '',
    class: klass = '',
    onrender
  }: {
    compose: Compose<T>
    width?: number
    height?: number
    speed?: number
    manual?: boolean
    palette?: string
    /** set for a meaningful image; otherwise the SVG is hidden from assistive tech */
    label?: string
    class?: string
    onrender?: (result: T) => void
  } = $props()

  const piece = $derived(render(compose, width, height, speed))
  $effect(() => onrender?.(piece.result))
</script>

<svg
  class="thread-svg pal-{palette} {klass}"
  viewBox="0 0 {width} {height}"
  data-sew
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
  use:sew={{ duration: piece.duration, manual }}>
  {@html piece.html}
</svg>
