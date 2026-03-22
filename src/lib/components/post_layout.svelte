<script lang="ts" module>
  import Image from '$lib/components/prose/img.svelte'
  import table from '$lib/components/prose/table.svelte'
  import Mermaid from '$lib/components/prose/mermaid.svelte'
  import PythonCode from '$lib/components/prose/code.svelte'
  import SlabTitle from '$lib/components/slab_title.svelte'
  import PokemonSprite from '$lib/components/pkmn/pokemon.svelte'
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
    PokemonSprite,
    PokemonSprite as pokemonsprite
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
