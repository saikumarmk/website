<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { posts as storedPosts } from '$lib/stores/posts'
  import { title as storedTitle } from '$lib/stores/title'
  import { getSeriesInfo } from '$lib/utils/series'
  import { sectionsOf } from '$lib/utils/toc'
  import { topics, topicOf, readMins } from '$lib/config/topics'
  import { seedLabel, seeded } from '$lib/thread'
  import { settleMargins } from '$lib/actions/settle-margins'
  import { satinSelect } from '$lib/actions/satin-select'
  import Head from '$lib/components/head.svelte'
  import Reply from '$lib/components/post_reply.svelte'
  import Image from '$lib/components/prose/img.svelte'
  import SlabTitle from '$lib/components/slab_title.svelte'
  import ReadingVine from '$lib/components/reading_vine.svelte'
  import Specimen from '$lib/components/thread/Specimen.svelte'
  import SeriesStrip from '$lib/components/series/SeriesStrip.svelte'
  import SeriesNext from '$lib/components/series/SeriesNext.svelte'
  import { markRead } from '$lib/stores/read'

  let { post, children }: { post: Blog.Post | null; children?: Snippet } = $props()

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' }) : ''

  let series = $derived(post ? getSeriesInfo(post) : undefined)
  let topic = $derived(post ? topicOf(post) : undefined)
  let words = $derived(post?.words ?? 0)
  let seed = $derived(post?.seed ?? post?.path ?? '')
  let updatedShown = $derived(
    !!post?.updated && !!post?.created && new Date(post.updated).toDateString() !== new Date(post.created).toDateString()
  )
  let sections = $derived(sectionsOf(post?.toc))

  let nearby = $derived.by(() => {
    if (!post) return []
    const listed = ($storedPosts ?? []).filter((p) => p.path !== post.path && !p.flags?.includes('unlisted') && p.type === 'article')
    const same = topic ? listed.filter((p) => topicOf(p) === topic) : []
    return (same.length ? same : listed).slice(0, 3)
  })

  let article = $state<HTMLElement>()

  /** Fullscreen deck: only on the client (`$page` is unavailable while genPosts renders posts for feeds). */
  let deckPresentation = $state(false)
  function syncDeckPresentation() {
    if (!browser || !post) return (deckPresentation = false)
    try {
      deckPresentation = !!post.slides && get(page).url.searchParams.get('mode') === 'slides'
    } catch {
      deckPresentation = false
    }
    document.body.classList.toggle('deck-presentation-active', deckPresentation)
  }
  onMount(() => {
    syncDeckPresentation()
    const unsub = page.subscribe(syncDeckPresentation)
    return () => {
      unsub()
      document.body.classList.remove('deck-presentation-active')
    }
  })

  $effect(() => {
    if (post) storedTitle.set(post.title ?? post.path.slice(1))
  })
</script>

<Head {post} />

{#if post}
  {#if deckPresentation}
    <div class="deck-presentation-shell">{@render children?.()}</div>
  {:else}
    <ReadingVine toc={post.toc} {article} />
    <div class="with-vine">
      <div class="col with-notes h-entry" itemscope itemtype="https://schema.org/BlogPosting" itemprop="blogPost">
        <header class="art-head">
          <div class="kicker smallcaps">
            {#if series}
              {#if series.series.name.includes('Playbook')}<a href="/playbook">{series.series.name}</a>{:else}{series.series.name}{/if}
              · {series.part === 0 ? 'FAQ' : `Part ${series.part}`}
            {:else if topic}
              <a href="/archive?topic={topic}">{topics[topic].label}</a>
            {/if}
          </div>
          {#if post.slab_title}
            <div itemprop="name headline" class="p-name">
              <SlabTitle title={post.title ?? post.path.slice(1)} slug={post.path} config={typeof post.slab_title === 'string' ? post.slab_title : ''} />
            </div>
          {:else}
            <h1 itemprop="name headline" class="p-name">{post.title ?? post.path.slice(1)}</h1>
          {/if}
          {#if post.summary}<p class="dek p-summary" itemprop="description">{post.summary}</p>{/if}
          <div class="meta">
            <a class="u-url" href={post.path}><time class="dt-published" datetime={new Date(post.published ?? post.created).toISOString()}>{fmt(post.published ?? post.created)}</time></a>
            {#if words}· {readMins(words)} min read · {words.toLocaleString('en-AU')} words{/if}
            {#if updatedShown}· updated <time class="dt-updated" datetime={new Date(post.updated).toISOString()}>{fmt(post.updated)}</time>{/if}
          </div>
        </header>

        <!-- series strip (renders nothing outside a series) -->
        <SeriesStrip {post} />

        {#if post.in_reply_to}<Reply in_reply_to={post.in_reply_to} />{/if}

        {#if sections.length > 1}
          <details class="contents-inline">
            <summary><span class="smallcaps">Contents</span> <span class="ci-n">{sections.length} sections</span></summary>
            <ol>
              {#each sections as h (h.slug)}
                <li><a href="#{h.slug}">{h.title}</a></li>
              {/each}
            </ol>
          </details>
        {/if}

        {#if post.image}
          <figure class="art-image"><Image class="u-featured" src={post.image} alt="" loading="eager" /></figure>
        {/if}

        <article class="post-prose e-content" itemprop="articleBody" bind:this={article} use:settleMargins>
          {@render children?.()}
        </article>

        {#if post.tags?.length}
          <div class="tags" aria-label="Tags">
            {#each post.tags as tag}<a class="p-category" href="/archive?tag={encodeURIComponent(tag)}">#{tag}</a>{/each}
          </div>
        {/if}

        <div class="fin" use:markRead={post.path}>
          <Specimen {seed} width={130} height={96} R={32} cy={0.42} fit={false} class="fin-flower" />
          {#if words}
            <span class="fin-cap">grown from this post's {words.toLocaleString('en-AU')} words · seed {seedLabel(seeded(seed).hash)}</span>
          {/if}
        </div>

        <!-- next-part card (renders nothing outside a series) -->
        <SeriesNext {post} />

        {#if nearby.length}
          <nav class="art-end" aria-label="Nearby">
            <div class="smallcaps">Nearby</div>
            <div use:satinSelect={{ items: 'li' }}>
            <ol class="toc">
              {#each nearby as p (p.path)}
                <li data-slug={p.path}>
                  <div class="row">
                    <Specimen seed={p.seed ?? p.path} width={130} height={96} R={32} cy={0.42} fit={false} leaves={false} class="near-bloom" />
                    <a href={p.path}><span class="t">{p.title}</span></a>
                    <span class="leader"></span>
                    <span class="meta">{readMins(p.words)} min</span>
                  </div>
                </li>
              {/each}
            </ol>
            </div>
          </nav>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .art-image {
    margin: 0 0 2.5rem;
  }
  .art-image :global(img) {
    width: 100%;
    display: block;
    border: 1px solid var(--rule);
  }
  .fin :global(.fin-flower) {
    width: 150px;
    height: 110px;
  }
</style>
