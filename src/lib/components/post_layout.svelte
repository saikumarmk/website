<script lang="ts" context="module">
  import Image from '$lib/components/prose/img.svelte'
  import table from '$lib/components/prose/table.svelte'
  export { Image as img, table }
</script>

<script lang="ts">
  import { typeOfPost } from '$lib/utils/posts'
  import Container from '$lib/components/post_container.svelte'
  import SlideDeck from '$lib/slides/SlideDeck.svelte'
  // auto-generated
  export let path
  export let slug
  export let toc
  // common
  export let created
  export let updated
  export let published
  export let summary
  export let tags
  export let flags
  // specify
  export let title
  export let image
  export let in_reply_to
  // custom
  export let slab_title = undefined
  /** Injected by remark-slide-split when `slides: true` — consumed silently. */
  export const slideSegmentCount = undefined
  export let slides = undefined
  // post
  let fm = {
    path,
    slug,
    toc,
    created,
    updated,
    published,
    summary,
    tags,
    flags,
    title,
    image,
    in_reply_to,
    slab_title,
    slides
  }
  let post = fm ? { type: typeOfPost(fm), ...fm } : null
</script>

<Container {post}>
  {#if slides}
    <SlideDeck {title} {path}>
      <slot />
    </SlideDeck>
  {:else}
    <slot />
  {/if}
</Container>
