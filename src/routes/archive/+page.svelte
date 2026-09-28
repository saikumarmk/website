<script lang="ts">
  import { afterNavigate, replaceState } from '$app/navigation'
  import { title as storedTitle } from '$lib/stores/title'
  import { topics, topicOf, readMins, type Topic } from '$lib/config/topics'
  import { getSeriesInfo } from '$lib/utils/series'
  import { satinSelect } from '$lib/actions/satin-select'
  import Head from '$lib/components/head.svelte'
  import Embroidery from '$lib/components/thread/Embroidery.svelte'
  import type { Builder } from '$lib/thread'

  storedTitle.set('Writing')

  let { data }: { data: { res?: Blog.Post[] } } = $props()

  type Shelf = Topic | 'elsewhere'
  type Tab = 'all' | Topic

  const listed = $derived((data.res ?? []).filter(p => !p.flags?.includes('unlisted')))
  /** Yggdrasil notes have their own index at /growth, and their tags can collide with shelf names */
  const onShelf = (p: Blog.Post) => !!topicOf(p) && !p.path.startsWith('/growth/')
  const writing = $derived(listed.filter(onShelf))

  let tab = $state<Tab>('all')
  let tag = $state<string | null>(null)

  const matches = (p: Blog.Post) => !tag || !!p.tags?.includes(tag)

  /** series parts in order, the FAQ after them, then anything else in the topic by date */
  const partOf = (p: Blog.Post) => getSeriesInfo(p)?.part
  const rank = (p: Blog.Post) => {
    const part = partOf(p)
    return part === undefined ? Infinity : part === 0 ? 1000 : part
  }
  const inShelf = (s: Shelf) => {
    const ps = (s === 'elsewhere' ? listed.filter(p => !onShelf(p)) : writing.filter(p => topicOf(p) === s)).filter(matches)
    return s === 'playbook' ? [...ps].sort((a, b) => rank(a) - rank(b)) : ps
  }

  const tabKeys = $derived<Tab[]>(['all', ...(Object.keys(topics) as Topic[]).filter(t => writing.some(p => topicOf(p) === t))])
  const tabIndex = $derived(Math.max(0, tabKeys.indexOf(tab)))
  const shelves = $derived.by<{ id: Shelf; posts: Blog.Post[] }[]>(() => {
    const ids: Shelf[] =
      tab === 'all' ? [...tabKeys.filter((t): t is Topic => t !== 'all'), ...(tag ? (['elsewhere'] as const) : [])] : [tab]
    return ids.map(id => ({ id, posts: inShelf(id) })).filter(s => s.posts.length || tab !== 'all')
  })
  const countFor = (t: Tab) => (t === 'all' ? writing.filter(matches).length : inShelf(t).length)
  const shelfLabel = (s: Shelf) => (s === 'elsewhere' ? 'Elsewhere' : topics[s].label)
  const shelfBlurb = (s: Shelf) => (s === 'elsewhere' ? 'Learning notes and pages outside the shelves.' : topics[s].blurb)

  const partLabel = (p: Blog.Post) => {
    const part = partOf(p)
    return part === undefined ? '' : part === 0 ? 'FAQ' : `Pt ${part}`
  }
  const short = (p: Blog.Post) => {
    const t = p.title ?? p.path.slice(1)
    return t.replace(/^The Grad\/Intern Playbook: (Part [\d.]+( Final Mix)? - |FAQ$)/, '') || 'Common questions'
  }
  const when = (p: Blog.Post) =>
    new Date(p.published ?? p.created).toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric',
      timeZone: 'Australia/Melbourne'
    })

  const numberWords = [
    'Zero',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ]
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const spell = (n: number) =>
    n < 20
      ? numberWords[n]
      : n < 100
        ? tens[Math.floor(n / 10)] + (n % 10 ? '-' + numberWords[n % 10].toLowerCase() : '')
        : String(n)
  const since = $derived(
    Math.min(...writing.map(p => new Date(p.published ?? p.created).getFullYear()), new Date().getFullYear())
  )

  /** query params are read in the browser, since prerendered pages have no search string */
  function readParams(url: URL) {
    const t = url.searchParams.get('topic')
    tab = t && t in topics ? (t as Topic) : 'all'
    tag = url.searchParams.get('tag') || null
  }
  afterNavigate(({ to }) => to?.url && readParams(to.url))
  $effect(() => {
    document.getElementById(`tab-${tab}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  })

  function syncUrl() {
    const url = new URL(location.href)
    url.search = ''
    if (tab !== 'all') url.searchParams.set('topic', tab)
    if (tag) url.searchParams.set('tag', tag)
    replaceState(url, {})
  }
  function choose(t: Tab) {
    tab = t
    syncUrl()
  }
  function clearTag() {
    tag = null
    syncUrl()
  }

  function onTabKey(e: KeyboardEvent) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    const to =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? tabKeys.length - 1
          : step
            ? (tabIndex + step + tabKeys.length) % tabKeys.length
            : -1
    if (to < 0) return
    e.preventDefault()
    choose(tabKeys[to])
    document.getElementById(`tab-${tabKeys[to]}`)?.focus()
  }

  const spray = (b: Builder, W: number, H: number) => {
    b.stem(b.curve(W * 0.95, H, W * 0.7, H * 0.7, W * 0.5, H * 0.45))
    b.leaf(W * 0.78, H * 0.86, W * 0.56, H * 0.72, 16, 0.2)
    b.leaf(W * 0.7, H * 0.64, W * 0.86, H * 0.5, 13, -0.22)
    b.rose(W * 0.46, H * 0.4, 52, { petals: 13, turn: 1.2 })
    b.knot(W * 0.2, H * 0.2, 2, 'g1', b.tick(60))
    b.knot(W * 0.26, H * 0.12, 2, 'g1', b.tick(60))
  }
</script>

<Head />

<div class="index-head">
  <Embroidery compose={spray} width={260} height={210} class="w-spray" />
  <h1>Writing</h1>
  <p class="col">
    {spell(writing.length)} pieces since {since}, grouped by what they're about. Essays run long; notes are allowed to be short.
  </p>
</div>

<div class="tabs-row">
  <div class="tabs-menu" use:satinSelect={{ items: '[role=tab]', selected: tabIndex, key: tabKeys.join() }}>
    <div class="tabs" role="tablist" aria-label="Topics" tabindex="-1" onkeydown={onTabKey}>
      {#each tabKeys as t (t)}
        <button
          type="button"
          role="tab"
          id="tab-{t}"
          aria-selected={t === tab}
          aria-controls="writing-shelves"
          tabindex={t === tab ? 0 : -1}
          onclick={() => choose(t)}>
          {t === 'all' ? 'Everything' : topics[t].label}
          <sup>{countFor(t)}</sup>
        </button>
      {/each}
    </div>
  </div>
</div>

<div class="col" id="writing-shelves" role="tabpanel" aria-labelledby="tab-{tab}">
  {#if tag}
    <p class="filter smallcaps">
      Tagged <b>#{tag}</b>
      ·
      <button type="button" class="linkish" onclick={clearTag}>show everything</button>
    </p>
  {/if}

  {#each shelves as shelf (shelf.id)}
    <section class="topic" aria-labelledby="shelf-{shelf.id}">
      <h2 id="shelf-{shelf.id}">
        {shelfLabel(shelf.id)}
        <span class="count">{shelf.posts.length}</span>
      </h2>
      <p class="blurb">
        {shelfBlurb(shelf.id)}
        {#if shelf.id === 'playbook'}<a href="/playbook">The series page</a>
          .{/if}
      </p>
      {#if shelf.posts.length}
        <div use:satinSelect={{ items: 'li', key: `${tab}:${tag}` }}>
          <ol class="toc">
            {#each shelf.posts as p (p.path)}
              <li data-slug={p.path}>
                <div class="row">
                  <a href={p.path}>
                    {#if partLabel(p)}<span class="part">{partLabel(p)}</span>{/if}
                    <span class="t">{short(p)}</span>
                  </a>
                  <span class="leader" aria-hidden="true"></span>
                  {#if tab === 'all'}
                    <span class="meta">{readMins(p.words)} min</span>
                  {:else}
                    <span class="meta"><time datetime={new Date(p.published ?? p.created).toISOString()}>{when(p)}</time></span>
                  {/if}
                </div>
                {#if tab !== 'all' && p.summary}<div class="sum">{p.summary}</div>{/if}
              </li>
            {/each}
          </ol>
        </div>
      {:else}
        <p class="none">Nothing here{tag ? ` tagged #${tag}` : ''} yet.</p>
      {/if}
    </section>
  {:else}
    <p class="none">Nothing is tagged #{tag}.</p>
  {/each}
</div>

<style>
  .index-head {
    margin: 4.5rem 0 1.5rem;
    position: relative;
  }
  .index-head h1 {
    font-size: 2.6rem;
    margin: 0 0 0.6rem;
    font-weight: 400;
  }
  .index-head p {
    color: var(--fg2);
    margin: 0;
  }
  .index-head :global(.w-spray) {
    position: absolute;
    left: calc(var(--measure) + var(--gap) - 1rem);
    top: -2rem;
    width: 16rem;
    height: 13rem;
  }
  @media (max-width: 59.99rem) {
    .index-head :global(.w-spray) {
      display: none;
    }
  }
  .tabs-row {
    margin: 0 0 2.2rem -1rem;
  }
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.1rem;
  }
  .tabs button {
    background: none;
    border: 0;
    padding: 0.3rem 1rem;
    font-family: var(--mono);
    font-size: 12.5px;
    color: var(--muted);
    cursor: var(--pointer);
    white-space: nowrap;
  }
  .tabs button[aria-selected='true'] {
    color: var(--fg);
  }
  .tabs button sup {
    font-size: 9.5px;
    margin-left: 0.2rem;
    opacity: 0.75;
  }
  /* one swipeable row; the bar sits inside the scrolled content so it scrolls with the tabs */
  @media (max-width: 40rem) {
    .tabs-row {
      overflow-x: auto;
      scrollbar-width: none;
      margin-right: -1.25rem;
      padding-bottom: 0.3rem;
    }
    .tabs-menu {
      width: max-content;
    }
    .tabs {
      flex-wrap: nowrap;
    }
  }
  .filter {
    margin: -1rem 0 2rem;
  }
  .filter b {
    color: var(--fg);
    font-weight: 500;
  }
  .filter .linkish {
    text-transform: none;
    letter-spacing: 0;
  }
  .topic {
    margin: 0 0 3rem;
  }
  .topic h2 {
    display: flex;
    gap: 0.8rem;
    align-items: baseline;
    font-size: 1.35rem;
    margin: 0 0 0.4rem;
  }
  .topic h2 .count {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    font-weight: 400;
  }
  .topic .blurb {
    font-size: 16px;
    color: var(--muted);
    margin: 0 0 0.5rem;
    font-style: italic;
  }
  .topic .blurb a {
    font-style: normal;
  }
  .none {
    color: var(--muted);
    font-style: italic;
  }
</style>
