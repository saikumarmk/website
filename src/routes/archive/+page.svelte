<script lang="ts">
  import { title as storedTitle } from '$lib/stores/title'
  import { getReadingTime } from '$lib/utils/reading-time'
  import { genTags } from '$lib/utils/posts'
  import Head from '$lib/components/head.svelte'

  storedTitle.set('Archive')

  let { data }: { data: { res?: Urara.Post[] } } = $props()
  let allPosts = $derived((data.res ?? []).filter(post => !post.flags?.includes('unlisted')))
  let allTags = $derived(genTags(allPosts))
  let selectedTag = $state<string | null>(null)
  let searchQuery = $state('')
  let activeView = $state<'all' | 'learning' | 'blog'>('all')

  function isLearningNote(post: Urara.Post): boolean {
    return (
      post.path?.startsWith('/growth/2026/') ||
      post.tags?.includes('yggdrasil') ||
      post.tags?.includes('learning-note') ||
      (post as any).growth !== undefined
    )
  }

  function date(post: Urara.Post): Date {
    return new Date(post.published ?? post.created)
  }

  let baseFilteredPosts = $derived(
    allPosts.filter(post => {
      const q = searchQuery.toLowerCase()
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag)
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.summary?.toLowerCase().includes(q) ||
        post.tags?.some(tag => tag.toLowerCase().includes(q))
      return matchesTag && matchesSearch
    })
  )
  let learningNotes = $derived(baseFilteredPosts.filter(isLearningNote))
  let blogPosts = $derived(baseFilteredPosts.filter(post => !isLearningNote(post)))
  let visiblePosts = $derived(activeView === 'learning' ? learningNotes : activeView === 'blog' ? blogPosts : baseFilteredPosts)
  let allLearningCount = $derived(allPosts.filter(isLearningNote).length)
  let allBlogCount = $derived(allPosts.length - allLearningCount)

  let postsByYear = $derived.by(() =>
    visiblePosts.reduce(
      (acc, post) => {
        const year = date(post).getFullYear()
        if (!acc[year]) acc[year] = []
        acc[year].push(post)
        return acc
      },
      {} as Record<number, Urara.Post[]>
    )
  )
  let years = $derived(Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a)))
  let tagCounts = $derived.by(() =>
    allPosts.reduce(
      (acc, post) => {
        post.tags?.forEach(tag => (acc[tag] = (acc[tag] || 0) + 1))
        return acc
      },
      {} as Record<string, number>
    )
  )
  let sortedTags = $derived.by(() => [...allTags].sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)))

  function clearFilters() {
    selectedTag = null
    searchQuery = ''
  }
</script>

<Head />

<div class="archive-page site-editorial-page">
  <header class="arch-head wrap">
    <h1 class="sr-only">Archive</h1>
    <span class="eyebrow">the archive</span>
    <h2>Everything I've <span>written</span>.</h2>
    <p>Browse every post by year, tag, or search.</p>

    <div class="type-pills">
      <button class:active={activeView === 'all'} onclick={() => (activeView = 'all')}>All ({allPosts.length})</button>
      <button class:active={activeView === 'blog'} onclick={() => (activeView = 'blog')}>Blog ({allBlogCount})</button>
      <button class:active={activeView === 'learning'} onclick={() => (activeView = 'learning')}>Learning ({allLearningCount})</button>
    </div>

    <div class="stats-row">
      <div><span>Showing</span><strong>{visiblePosts.length}</strong><small>matching posts</small></div>
      <div><span>Total</span><strong>{allPosts.length}</strong><small>{allLearningCount} learning · {allBlogCount} blog</small></div>
      <div><span>Tags</span><strong>{allTags.length}</strong><small>across the archive</small></div>
    </div>
  </header>

  <div class="wrap arch-grid">
    <aside class="sidebar">
      <label for="arch-search">Search</label>
      <div class="search-wrap">
        <span class="i-heroicons-outline-magnifying-glass"></span>
        <input id="arch-search" type="search" placeholder="Search posts..." bind:value={searchQuery} />
      </div>
      {#if selectedTag || searchQuery}
        <button class="clear-btn" onclick={clearFilters}>Clear filters</button>
      {/if}

      <div class="side-label">Tags</div>
      <div class="tags-list">
        {#each sortedTags as tag}
          <button class:active={selectedTag === tag} onclick={() => (selectedTag = selectedTag === tag ? null : tag)}>
            <span>#{tag}</span><small>{tagCounts[tag]}</small>
          </button>
        {/each}
      </div>
    </aside>

    <main>
      {#if visiblePosts.length === 0}
        <div class="empty">No posts match that. <button onclick={clearFilters}>Clear the filters</button> and try again.</div>
      {:else}
        <div class="feed">
          {#each years as year}
            <section class="feed-year">
              <div class="year-head">
                <span>{year}</span><i></i><small>{postsByYear[Number(year)].length} post{postsByYear[Number(year)].length === 1 ? '' : 's'}</small>
              </div>
              {#each postsByYear[Number(year)] as post}
                {@const d = date(post)}
                <a class="post-row" href={post.path}>
                  <span class="post-date"><b>{d.getDate()}</b>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span class="post-main">
                    <span class="post-title">
                      <strong>{post.title || post.path.slice(1)}</strong>
                      {#if isLearningNote(post)}<em>learning</em>{/if}
                    </span>
                    {#if post.summary}<span>{post.summary}</span>{/if}
                    <span class="post-tags">
                      {#each (post.tags ?? []).slice(0, 4) as tag}
                        <i class:active={tag === selectedTag}>#{tag}</i>
                      {/each}
                    </span>
                  </span>
                  <span class="post-meta">{getReadingTime(post.html) ?? 'read'} →</span>
                </a>
              {/each}
            </section>
          {/each}
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .archive-page {
    --panel: var(--site-panel);
    --panel-2: var(--site-panel-2);
    --line: var(--site-line);
    --line-strong: var(--site-line-strong);
    --fg: var(--site-fg);
    --fg-2: var(--site-fg-2);
    --muted: var(--site-muted);
    --dim: var(--site-dim);
    --accent: var(--site-accent);
    --accent-ink: var(--site-accent-ink);
    --mono: var(--site-mono);
    --mono2: var(--site-mono2);
    --sans: var(--site-sans);
    padding-bottom: 80px;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding-inline: clamp(20px, 5vw, 84px); }
  .arch-head { padding-block: clamp(40px, 7vh, 80px) 8px; }
  .eyebrow { font-family: var(--mono); font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
  .arch-head h2 { font-family: var(--sans); font-size: clamp(2.4rem, 6vw, 3.8rem); line-height: 1; letter-spacing: -.04em; margin: 16px 0 10px; font-weight: 800; }
  .arch-head h2 span { color: var(--accent); }
  .arch-head p { color: var(--muted); font-size: 15px; }
  .type-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
  .type-pills button, .clear-btn {
    font-family: var(--mono); font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 999px;
    border: 1px solid var(--line-strong); background: transparent; color: var(--muted); transition: .15s;
  }
  .type-pills button:hover, .clear-btn:hover { color: var(--fg); border-color: var(--accent); }
  .type-pills button.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px; }
  .stats-row div { border: 1px solid var(--line); border-radius: 18px; padding: 18px 20px; background: color-mix(in srgb, var(--panel) 78%, transparent); }
  .stats-row span, .sidebar label, .side-label { display: block; font-family: var(--mono); font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--dim); }
  .stats-row strong { display: block; color: var(--accent); font-family: var(--mono); font-size: 34px; line-height: 1.1; margin-top: 6px; }
  .stats-row small { color: var(--muted); font-size: 12px; }
  .arch-grid { display: grid; grid-template-columns: 248px 1fr; gap: clamp(28px, 5vw, 56px); padding-top: 44px; }
  .sidebar { position: sticky; top: 88px; align-self: start; }
  .search-wrap { position: relative; margin: 14px 0 18px; }
  .search-wrap span { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--dim); }
  .search-wrap input { width: 100%; background: var(--panel); color: var(--fg); border: 1px solid var(--line-strong); border-radius: 12px; padding: 11px 12px 11px 38px; outline: none; }
  .search-wrap input:focus { border-color: var(--accent); }
  .clear-btn { width: 100%; margin-bottom: 28px; }
  .tags-list { display: flex; flex-direction: column; gap: 3px; max-height: 60vh; overflow: auto; margin-top: 14px; }
  .tags-list button { display: flex; justify-content: space-between; gap: 10px; border: 0; background: transparent; color: var(--muted); border-radius: 8px; padding: 8px 10px; font-family: var(--mono); font-size: 13px; font-weight: 700; text-align: left; text-transform: uppercase; }
  .tags-list button:hover { background: var(--panel); color: var(--fg); }
  .tags-list button.active { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); }
  .tags-list small { min-width: 22px; height: 20px; display: grid; place-items: center; border-radius: 999px; background: var(--panel-2); color: var(--muted); }
  .feed { display: flex; flex-direction: column; gap: 18px; }
  .year-head { display: flex; align-items: center; gap: 18px; margin: 6px 0 8px; }
  .year-head span { font-family: var(--mono); font-size: 22px; font-weight: 700; color: var(--accent); }
  .year-head i { flex: 1; height: 1px; background: var(--line); }
  .year-head small { color: var(--dim); font-family: var(--mono); font-size: 12px; }
  .post-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 20px; align-items: baseline; padding: 16px 12px; border-radius: 12px; border: 1px solid transparent; transition: .15s; }
  .post-row:hover { background: var(--panel); border-color: var(--line); transform: translateX(4px); }
  .post-date { font-family: var(--mono); color: var(--dim); font-size: 12px; text-transform: uppercase; text-align: right; }
  .post-date b { display: block; color: var(--fg-2); font-size: 18px; }
  .post-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .post-title strong { font-family: var(--mono); color: var(--fg); font-size: 16px; }
  .post-title em { font-style: normal; font-size: 9px; text-transform: uppercase; color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent); border-radius: 999px; padding: 1px 7px; }
  .post-main > span:not(.post-tags) { display: block; color: var(--muted); margin-top: 5px; font-size: 14px; line-height: 1.55; max-width: 62ch; }
  .post-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
  .post-tags i { color: var(--muted); border: 1px solid var(--line-strong); border-radius: 999px; padding: 3px 10px; font-family: var(--mono); font-size: 11px; font-style: normal; }
  .post-tags i.active { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, transparent); }
  .post-meta { color: var(--dim); font-family: var(--mono); font-size: 12px; white-space: nowrap; }
  .empty { color: var(--muted); padding: 40px 0; }
  .empty button { color: var(--accent); text-decoration: underline; }
  @media (max-width: 860px) { .arch-grid, .stats-row { grid-template-columns: 1fr; } .sidebar { position: static; } }
  @media (max-width: 640px) { .post-row { grid-template-columns: 50px 1fr; } .post-meta { display: none; } }
</style>
