<script lang="ts">
  import Embroidery from './Embroidery.svelte'
  import { seeded, type Species } from '$lib/thread'

  let {
    seed,
    size = 200,
    width = size,
    height = size,
    R = Math.min(width, height) * 0.31,
    cy = 0.46,
    fit = true,
    leaves = true,
    species = null,
    speed = 1,
    label = '',
    class: klass = '',
    onrender
  }: {
    /** any text (a slug, a project id, a post body), or a precomputed hash such as a post's `seed` */
    seed: string | number
    size?: number
    width?: number
    height?: number
    R?: number
    /** vertical position of the flower's heart, as a fraction of the height */
    cy?: number
    /** shrink the flower so nothing leaves the box */
    fit?: boolean
    leaves?: boolean
    species?: Species | null
    speed?: number
    label?: string
    class?: string
    onrender?: (info: { species: Species; hash: number }) => void
  } = $props()

  const sd = $derived(seeded(seed))
</script>

<Embroidery
  {width}
  {height}
  {speed}
  {label}
  class={klass}
  palette={sd.palette}
  compose={(b, W, H) => b.specimen(W / 2, H * cy, R, seeded(seed).rng, { leaves, box: fit ? [W, H] : null, species })}
  onrender={kind => onrender?.({ species: kind, hash: sd.hash })} />
