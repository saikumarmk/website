<script lang="ts" module>
  import {
    Image,
    table,
    Mermaid,
    PythonCode,
    SlabTitle,
    Patch,
    Sidenote
  } from '$lib/mdsvex/embed-registry'
  /**
   * mdsvex rewrites tags to `Components.Name` using **exported names**; HTML/rehype lowercases tag names,
   * so we export PascalCase + lowercase aliases (e.g. SlabTitle + slabtitle).
   */
  export {
    Image as img,
    table,
    Mermaid,
    Mermaid as mermaid,
    PythonCode,
    PythonCode as pythoncode,
    SlabTitle,
    SlabTitle as slabtitle,
    Patch,
    Patch as patch,
    Sidenote,
    Sidenote as sidenote
  }
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
    topic = undefined,
    words = undefined,
    seed = undefined,
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
      slides,
      topic,
      words,
      seed
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
