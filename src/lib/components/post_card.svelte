<script lang="ts">
  import { browser } from '$app/environment'
  import { post as postConfig } from '$lib/config/post'
  import { posts as storedPosts } from '$lib/stores/posts'
  import { title as storedTitle } from '$lib/stores/title'
  import Reply from '$lib/components/post_reply.svelte'
  import Status from '$lib/components/post_status.svelte'
  import Image from '$lib/components/prose/img.svelte'
  import RandomPokemonSprite from '$lib/components/pkmn/random_pokemon.svelte'
  import Pagination from '$lib/components/post_pagination.svelte'
  import Comment from '$lib/components/post_comment.svelte'
  import RelatedPosts from '$lib/components/related_posts.svelte'
  import SlabTitle from '$lib/components/slab_title.svelte'
  export let post: Urara.Post
  /** Fullscreen slide deck: hide blog chrome, only render body slot */
  export let deckPresentation = false
  export let preview: boolean = false
  export let loading: 'eager' | 'lazy' = 'lazy'
  export let decoding: 'async' | 'sync' | 'auto' = 'async'
  // pagination
  let index: number
  let prev: Urara.Post | undefined = undefined
  let next: Urara.Post | undefined = undefined
  if (browser && !preview)
    storedPosts.subscribe((storedPosts: Urara.Post[]) => {
      index = storedPosts.findIndex(storedPost => storedPost.path === post.path)
      prev = storedPosts
        .slice(0, index)
        .reverse()
        .find(post => !post.flags?.includes('unlisted'))
      next = storedPosts.slice(index + 1).find(post => !post.flags?.includes('unlisted'))
      storedTitle.set(post.title ?? post.path.slice(1))
    })
</script>

<svelte:element
  this={post.type === 'article' ? 'article' : 'div'}
  itemscope
  itemtype="https://schema.org/BlogPosting"
  itemprop="blogPost"
  class:md:mb-8={!preview && !deckPresentation}
  class:lg:mb-16={!preview && !deckPresentation}
  class:group={preview}
  class:image-full={preview && post.type === 'article' && post.image}
  class:before:!rounded-none={preview && post.image}
  class="h-entry z-10 {deckPresentation
    ? 'w-full max-w-none bg-transparent shadow-none p-0 m-0 flex flex-col flex-1 min-h-0 min-h-[100dvh] overflow-hidden border-0'
    : 'card bg-base-100 rounded-none md:rounded-box md:shadow-xl overflow-hidden'}">
  {#if !preview && !deckPresentation}
    <slot name="breadcrumb" />
  {/if}
  {#if !preview && !deckPresentation && postConfig.bridgy}
    <div id="bridgy" class="hidden">
      {#each post.flags?.some( flag => flag.startsWith('bridgy') ) ? post.flags.flatMap( flag => (flag.startsWith('bridgy') ? flag.slice(7) : []) ) : [...(postConfig.bridgy.post ?? []), ...(postConfig.bridgy[post.type] ?? [])] as target}
        {#if target === 'fed'}
          <a href="https://fed.brid.gy/">fed</a>
        {:else}
          <a href="https://brid.gy/publish/{target}">{target}</a>
        {/if}
      {/each}
    </div>
  {/if}
  {#if post.in_reply_to && !deckPresentation}
    <Reply in_reply_to={post.in_reply_to} class="mt-4 mx-4" />
  {/if}
  {#if post.image && preview}
    <figure class="!block">
      <Image
        class={post.type === 'article'
          ? 'u-featured object-center h-full w-full absolute group-hover:scale-105 transition-transform duration-500 ease-in-out'
          : 'u-photo rounded-xl md:rounded-b-none -mb-6 md:-mb-2'}
        src={post.image}
        alt={post.image}
        {loading}
        {decoding} />
    </figure>
  {/if}
  <div
    class={`${deckPresentation ? '' : 'card-body'} gap-0 ${
      preview && post.type === 'article' && post.image ? 'md:col-start-1 md:row-start-1 md:text-neutral-content md:z-20' : ''
    } ${deckPresentation ? '!p-0 flex flex-1 flex-col min-h-0' : ''}`}>
    <div class="flex flex-col gap-2">
      {#if post.image && !preview && !deckPresentation}
        <figure
          class={`md:order-last rounded-box shadow-xl mb-4 ${
            post.type === 'article' ? 'flex-col gap-2 -mx-4 -mt-8 md:mt-0' : 'flex-col -mx-8'
          }`}>
          <Image
            class={`${post.type === 'article' ? 'u-featured' : 'u-photo'}`}
            src={post.image}
            alt={post.image}
            {loading}
            {decoding} />
        </figure>
      {/if}
      {#if !deckPresentation}
      <Status {post} {preview} />
      {/if}
      {#if post.title && !deckPresentation}
        {#if preview}
          <h2
            itemprop="name headline"
            class="card-title text-3xl mr-auto bg-[length:100%_0%] bg-[position:0_88%] underline decoration-4 decoration-transparent group-hover:decoration-primary hover:bg-[length:100%_100%] hover:text-primary-content bg-gradient-to-t from-primary to-primary bg-no-repeat transition-all ease-in-out duration-300">
            <a itemprop="url" class="u-url p-name" href={post.path}>{post.title ?? post.path.slice(1)}</a>
            <RandomPokemonSprite />
          </h2>
        {:else if post.slab_title}
          <div itemprop="name headline" class="mb-8 p-name">
            <SlabTitle 
              title={post.title ?? post.path.slice(1)} 
              slug={post.path}
              config={typeof post.slab_title === 'string' ? post.slab_title : ''}
            />
          </div>
        {:else}
          <h1 itemprop="name headline" class="card-title text-3xl mb-8 p-name">{post.title ?? post.path.slice(1)}</h1>
        {/if}
      {/if}
      {#if post.summary && !deckPresentation}
        <p itemprop="description" class:hidden={!preview || post.type !== 'article'} class="p-summary mb-auto">
          {post.summary}
        </p>
      {/if}
    </div>
    <main
      itemprop="articleBody"
      class:mt-4={post.type !== 'article' && !deckPresentation}
      class="urara-prose prose e-content {deckPresentation ? '!max-w-none !px-0 !py-0 flex flex-1 flex-col min-h-0' : ''}">
      {#if !preview}
        <slot />
      {:else if post.html}
        {@html post.html}
      {/if}
    </main>
    {#if !preview && post.tags && !deckPresentation}
      <div class="divider mt-4 mb-0" />
      <div>
        {#each post.tags as tag}
          <a href="/?tags={tag}" class="btn btn-sm btn-ghost normal-case mt-2 mr-2 p-category">
            #{tag}
          </a>
        {/each}
      </div>
    {/if}
  </div>
  {#if !preview && !deckPresentation}
    {#if !post.flags?.includes('related-disabled')}
      <div class="px-4 md:px-8">
        <RelatedPosts currentPost={post} />
      </div>
    {/if}
    {#if (prev || next) && !post.flags?.includes('pagination-disabled') && !post.flags?.includes('unlisted')}
      <Pagination {next} {prev} />
    {/if}
    {#if browser && postConfig.comment && !post.flags?.includes('comment-disabled')}
      <Comment {post} config={postConfig.comment} />
    {/if}
  {/if}
</svelte:element>
