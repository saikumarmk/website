<script lang="ts" module>
  import Image from '$lib/components/prose/img.svelte'
  import table from '$lib/components/prose/table.svelte'
  export { Image as img, table }
</script>

<script lang="ts">
  import { typeOfPost } from '$lib/utils/posts'
  import Container from '$lib/components/post_container.svelte'
  import SlideDeck from '$lib/slides/SlideDeck.svelte'

  let {
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
    slab_title = undefined,
    slideSegmentCount: _slideSegmentCount = undefined,
    slides = undefined,
    children
  } = $props()

  let post = $derived.by(() => {
    const fm = {
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
    return { type: typeOfPost(fm), ...fm }
  })
</script>

<Container {post}>
  {#if slides}
    <SlideDeck {title} {path}>
      {@render children?.()}
    </SlideDeck>
  {:else}
    {@render children?.()}
  {/if}
</Container>
