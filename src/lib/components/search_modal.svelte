<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { goto } from '$app/navigation'
  import FlexSearch from 'flexsearch'
  import { FLEXSEARCH_DOCUMENT_OPTIONS } from '$lib/search/flexsearch-config'
  import { SEARCH_EVENT } from '$lib/search/open'
  import { satinSelect } from '$lib/actions/satin-select'
  import type { SearchEntry, SearchGroup, SearchIndexJson } from '$lib/utils/search-index-data'
  import Specimen from '$lib/components/thread/Specimen.svelte'

  const GROUPS: SearchGroup[] = ['Writing', 'Project Dex', 'Pages']
  const FIELD_SCORE: Record<string, number> = { title: 100, tags: 50, summary: 30, content: 10 }

  let isOpen = $state(false)
  let query = $state('')
  let selected = $state(0)
  let input = $state<HTMLInputElement>()
  let opener: HTMLElement | null = null

  let entries: SearchEntry[] = []
  let byPath = new Map<string, SearchEntry>()
  let searchIndex: any = null
  let indexLoading = $state(false)
  let indexLoaded = $state(false)
  let indexFailed = $state(false)

  async function loadSearchIndex() {
    if (indexLoaded || indexLoading) return
    indexLoading = true
    indexFailed = false
    try {
      const data: SearchIndexJson = await (await fetch('/search-index.json')).json()
      entries = [...(data.posts ?? []), ...(data.dex ?? []), ...(data.pages ?? [])]
      byPath = new Map(entries.map((e) => [e.path, e]))
      searchIndex = new FlexSearch.Document(FLEXSEARCH_DOCUMENT_OPTIONS)
      for (const [key, chunk] of data.serializedIndex ?? []) searchIndex.import(key, chunk)
      indexLoaded = true
    } catch (error) {
      console.error('Failed to load search index:', error)
      indexFailed = true
    } finally {
      indexLoading = false
    }
  }

  type Hit = SearchEntry & { snippet?: string }

  const words = $derived(
    [...new Set(query.trim().toLowerCase().split(/\s+/).filter(Boolean))].sort((a, b) => b.length - a.length)
  )

  function snippetOf(content: string, word: string) {
    const at = content.toLowerCase().indexOf(word)
    if (at < 0) return undefined
    const start = Math.max(0, at - 24)
    const end = Math.min(content.length, at + word.length + 80)
    return (start > 0 ? '…' : '') + content.slice(start, end).trim() + (end < content.length ? '…' : '')
  }

  /** FlexSearch covers post bodies; a plain every-word match over the short fields catches the rest */
  function find(q: string, ws: string[]): Hit[] {
    const scores = new Map<string, number>()
    const add = (path: string, s: number) => byPath.has(path) && scores.set(path, (scores.get(path) ?? 0) + s)
    try {
      const raw = searchIndex?.search(q, { limit: 30 })
      for (const field of Array.isArray(raw) ? raw : []) {
        for (const id of field.result ?? []) add(String(id), FIELD_SCORE[field.field] ?? 10)
      }
    } catch (e) {
      console.error('FlexSearch search failed:', e)
    }
    for (const e of entries) {
      const tl = e.title.toLowerCase()
      const hay = `${tl} ${e.summary} ${e.meta} ${e.tags.join(' ')}`.toLowerCase()
      if (ws.every((w) => hay.includes(w))) add(e.path, ws.reduce((a, w) => a + (tl.startsWith(w) ? 60 : tl.includes(w) ? 30 : 10), 0))
    }
    return [...scores]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path]) => {
        const e = byPath.get(path)!
        const shown = `${e.title} ${e.summary}`.toLowerCase()
        const missing = ws.find((w) => !shown.includes(w))
        return { ...e, snippet: missing && e.content ? snippetOf(e.content, missing) : undefined }
      })
  }

  const hits = $derived.by<Hit[]>(() => {
    if (!indexLoaded) return []
    const found = words.length
      ? find(query.trim(), words)
      : [...entries.filter((e) => e.group === 'Writing' && e.meta && e.meta !== 'Yggdrasil').slice(0, 4), ...entries.filter((e) => e.group === 'Pages')]
    return GROUPS.flatMap((g) => found.filter((h) => h.group === g))
  })
  const groups = $derived(
    GROUPS.map((g) => ({ g, start: hits.findIndex((h) => h.group === g), items: hits.filter((h) => h.group === g) })).filter((x) => x.items.length)
  )
  const active = $derived(hits.length ? Math.min(selected, hits.length - 1) : -1)

  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  function segments(text: string, ws: string[]) {
    if (!ws.length || !text) return [{ t: text, m: false }]
    const re = new RegExp(`(${ws.map(escapeRe).join('|')})`, 'ig')
    return text
      .split(re)
      .filter(Boolean)
      .map((t) => ({ t, m: ws.includes(t.toLowerCase()) }))
  }

  export function open(prefill = '') {
    if (isOpen) {
      if (prefill) query = prefill
      input?.focus()
      return
    }
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    query = prefill
    selected = 0
    isOpen = true
    const page = document.querySelector<HTMLElement>('.page')
    if (page) page.inert = true
    document.body.style.overflow = 'hidden'
    loadSearchIndex()
    tick().then(() => input?.focus())
  }

  export function close() {
    if (!isOpen) return
    isOpen = false
    query = ''
    const page = document.querySelector<HTMLElement>('.page')
    if (page) page.inert = false
    document.body.style.overflow = ''
    opener?.focus({ preventScroll: true })
    opener = null
  }

  function choose(k: number) {
    const h = hits[k]
    if (!h) return
    close()
    goto(h.path)
  }

  function move(step: number) {
    if (!hits.length) return
    selected = (active + step + hits.length) % hits.length
    document.getElementById(`sr-${selected}`)?.scrollIntoView({ block: 'nearest' })
  }

  function onInputKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(e.key === 'ArrowDown' ? 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(active)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    }
  }

  const typing = (el: Element | null) =>
    !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || (el as HTMLElement).isContentEditable)

  function onGlobalKey(e: KeyboardEvent) {
    const isK = e.code === 'KeyK' || e.key.toLowerCase() === 'k'
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && isK) {
      e.preventDefault()
      e.stopPropagation()
      isOpen ? close() : open()
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      close()
    } else if (e.key === '/' && !isOpen && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(document.activeElement)) {
      e.preventDefault()
      open()
    }
  }

  onMount(() => {
    const onEvent = (e: Event) => open((e as CustomEvent<{ query?: string }>).detail?.query ?? '')
    // capture, so ⌘K beats focused inputs and other handlers
    window.addEventListener('keydown', onGlobalKey, true)
    window.addEventListener(SEARCH_EVENT, onEvent)
    return () => {
      window.removeEventListener('keydown', onGlobalKey, true)
      window.removeEventListener(SEARCH_EVENT, onEvent)
    }
  })
</script>

{#snippet marked(text: string)}
  {#each segments(text, words) as s, i (i)}{#if s.m}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}
{/snippet}

{#if isOpen}
  <div class="search">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="search-scrim" aria-hidden="true" onclick={close}></div>
    <div class="search-box" role="dialog" aria-modal="true" aria-label="Search">
      <div class="search-in">
        <input
          bind:this={input}
          bind:value={query}
          oninput={() => (selected = 0)}
          onkeydown={onInputKey}
          id="search-title"
          type="search"
          placeholder="Posts, projects, pages…"
          autocomplete="off"
          spellcheck="false"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls="sr"
          aria-activedescendant={active >= 0 ? `sr-${active}` : undefined}
          aria-label="Search the site" />
        <kbd>esc</kbd>
      </div>

      <div class="sr-scroll">
        <div class="sr-menu" use:satinSelect={{ items: '.hit', selected: active, key: `${query}|${active}|${hits.length}` }}>
          <div class="sr" id="sr" role="listbox" aria-label="Results">
            {#each groups as { g, start, items } (g)}
              <div role="group" aria-labelledby="sr-g-{g.replace(' ', '-')}">
                <div class="grp" id="sr-g-{g.replace(' ', '-')}">{!words.length && g === 'Writing' ? 'Recently' : g}</div>
                {#each items as h, i (h.path)}
                  {@const k = start + i}
                  <a
                    class="hit"
                    role="option"
                    id="sr-{k}"
                    href={h.path}
                    tabindex="-1"
                    aria-selected={k === active}
                    onpointermove={() => (selected = k)}
                    onclick={close}>
                    <Specimen seed={h.seed} size={60} R={30} cy={0.5} leaves={false} speed={2} class="hit-bloom" />
                    <span class="t">
                      {@render marked(h.title)}
                      {#if h.snippet || h.summary}<span class="d">{@render marked(h.snippet ?? h.summary)}</span>{/if}
                    </span>
                    <span class="m">{h.meta}</span>
                  </a>
                {/each}
              </div>
            {/each}
          </div>
        </div>
        {#if indexLoading}
          <p class="none">Threading the index…</p>
        {:else if indexFailed}
          <p class="none">The search index didn't load. Try again in a moment.</p>
        {:else if indexLoaded && words.length && !hits.length}
          <p class="none">Nothing matches "{query.trim()}". Try a topic, a language, or a project name.</p>
        {/if}
      </div>

      <div class="search-foot">
        <span><kbd>↑</kbd> <kbd>↓</kbd> move · <kbd>↵</kbd> open</span>
        <span aria-live="polite">{words.length && indexLoaded ? `${hits.length} found` : ''}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .search {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    justify-items: center;
    align-items: start;
    padding: 12vh 1rem 1rem;
  }
  .search-scrim {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    backdrop-filter: blur(3px);
  }
  .search-box {
    position: relative;
    width: min(40rem, 100%);
    max-height: 72vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--fg);
    border: 1px solid color-mix(in srgb, var(--fg2) 60%, transparent);
    border-radius: 14px;
    box-shadow: 0 30px 60px -30px color-mix(in srgb, var(--fg) 45%, transparent);
    overflow: hidden;
  }
  .search-box::after {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1.5px dashed color-mix(in srgb, var(--g1) 70%, transparent);
    border-radius: 10px;
    pointer-events: none;
  }
  @media (prefers-reduced-motion: no-preference) {
    .search-scrim {
      animation: search-fade 0.18s ease both;
    }
    .search-box {
      animation: search-rise 0.22s ease both;
    }
  }
  @keyframes search-fade {
    from {
      opacity: 0;
    }
  }
  @keyframes search-rise {
    from {
      opacity: 0;
      transform: translateY(-0.6rem);
    }
  }
  .search-in {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.9rem 1.2rem;
    border-bottom: 1px solid var(--rule);
  }
  .search-in input {
    flex: 1;
    border: 0;
    background: none;
    font: inherit;
    font-size: 1.15rem;
    color: var(--fg);
    outline: none;
    min-width: 0;
  }
  .search-in input::-webkit-search-cancel-button {
    display: none;
  }
  .search-in kbd,
  .search-foot kbd {
    font-size: 10.5px;
    padding: 0 0.3rem;
    color: var(--fg2);
  }
  .sr-scroll {
    overflow-y: auto;
    padding: 0.4rem 1.2rem 0.6rem;
  }
  .grp {
    font-family: var(--mono);
    font-size: 10.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0.8rem 0 0.25rem;
  }
  .hit {
    display: grid;
    grid-template-columns: 30px 1fr auto;
    gap: 0.6rem;
    align-items: center;
    padding: 0.35rem 0.9rem;
    margin: 0 -0.9rem;
    cursor: pointer;
    text-decoration: none;
    color: var(--fg);
  }
  .hit :global(.hit-bloom) {
    width: 30px;
    height: 30px;
  }
  .hit .t {
    line-height: 1.3;
    min-width: 0;
  }
  .hit .d {
    display: block;
    font-size: 14px;
    color: var(--muted);
    font-style: italic;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hit .m {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
    white-space: nowrap;
  }
  .hit mark {
    background: none;
    color: inherit;
    text-decoration: underline 1.5px var(--g1);
    text-underline-offset: 3px;
  }
  .none {
    padding: 1.2rem 0;
    margin: 0;
    color: var(--muted);
    font-style: italic;
  }
  .search-foot {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 1.2rem 0.8rem;
    border-top: 1px solid var(--rule);
    font-family: var(--mono);
    font-size: 11px;
    color: var(--muted);
  }
  @media (max-width: 40rem) {
    .search {
      padding-top: 4vh;
    }
    .hit .m {
      display: none;
    }
    .hit {
      grid-template-columns: 30px 1fr;
    }
  }
</style>
