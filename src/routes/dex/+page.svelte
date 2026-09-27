<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { replaceState } from '$app/navigation'
  import { projects } from '$lib/config/portfolio'
  import { posts } from '$lib/stores/posts'
  import { satinSelect } from '$lib/actions/satin-select'
  import { NAMES, render, seeded, seedLabel, type Compose, type Species } from '$lib/thread'
  import Embroidery from '$lib/components/thread/Embroidery.svelte'
  import Specimen from '$lib/components/thread/Specimen.svelte'
  import Pokemon from '$lib/components/pkmn/pokemon.svelte'
  import Head from '$lib/components/head.svelte'
  import { title as storedTitle } from '$lib/stores/title'

  storedTitle.set('Project Dex')

  const types = [...new Set(projects.flatMap((p) => p.tags ?? []))]
  const tabs = ['all', ...types]
  const count = (t: string) => (t === 'all' ? projects.length : projects.filter((p) => p.tags?.includes(t)).length)
  const written = projects.filter((p) => p.post).length
  const live = projects.filter((p) => p.buttons?.length).length

  const no = (i: number) => String(i + 1).padStart(3, '0')
  const siteOf = (i: number) => projects[i].buttons?.[0]?.href
  const titleCase = (s: string) => s.replace(/(^|-)([a-z])/g, (_, d, c) => d + c.toUpperCase())
  const indexOf = (id: string) => projects.findIndex((p) => p.id === id)

  let tab = $state('all')
  let cur = $state(0)
  let announce = $state('')
  let tabsEl = $state<HTMLElement>()
  let listEl = $state<HTMLElement>()
  let nameEl = $state<HTMLElement>()
  let screenEl = $state<HTMLElement>()

  const shown = $derived(projects.flatMap((p, i) => (tab === 'all' || p.tags?.includes(tab) ? [i] : [])))
  const entry = $derived(projects[cur])
  const post = $derived(entry.post ? $posts.find((p) => p.path === `/${entry.post}`) : undefined)
  const successor = $derived(entry.retired ? projects[indexOf(entry.retired)] : undefined)
  const sd = $derived(seeded(entry.name))
  const hoop: Compose<Species> = $derived((b, W, H) => b.specimen(W / 2, H * 0.46, 62, seeded(entry.name).rng, { box: [W, H] }))
  const species = $derived(render(hoop, 200, 200).result)

  function select(i: number, { hash = true } = {}) {
    if (i < 0) return
    cur = i
    if (!shown.includes(i)) tab = 'all'
    const p = projects[i]
    announce = `No. ${no(i)}, ${p.name}, the ${p.category} Project`
    if (hash) replaceState(`${location.pathname}${location.search}#${p.id}`, {})
  }

  function step(d: number, from = cur) {
    const k = shown.indexOf(from)
    select(shown[(k + d + shown.length) % shown.length])
  }

  function setTab(t: string) {
    tab = t
    if (!shown.includes(cur)) select(shown[0])
  }

  async function focusIn(el: HTMLElement | undefined, sel: string) {
    await tick()
    el?.querySelector<HTMLElement>(sel)?.focus()
  }

  async function evolve(id: string) {
    select(indexOf(id))
    await tick()
    nameEl?.focus()
  }

  function pick(i: number) {
    select(i)
    if (innerWidth < 960) screenEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
    const t = e.target as HTMLElement
    if (t.closest('input, textarea, select, [contenteditable]') || document.querySelector('[aria-modal="true"]')) return
    const inList = !!listEl?.contains(t)
    const inTabs = !!tabsEl?.contains(t)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const focused = inList ? Number(t.closest<HTMLElement>('[data-i]')?.dataset.i ?? cur) : cur
      step(e.key === 'ArrowDown' ? 1 : -1, focused)
      if (inList) focusIn(listEl, `[data-i="${cur}"]`)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const k = tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1)
      setTab(tabs[(k + tabs.length) % tabs.length])
      if (inTabs) focusIn(tabsEl, '[aria-selected="true"]')
    }
  }

  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1))
    const i = id ? indexOf(id) : -1
    if (i >= 0 && i !== cur) select(i, { hash: false })
  }

  onMount(() => {
    fromHash()
    addEventListener('hashchange', fromHash)
    return () => removeEventListener('hashchange', fromHash)
  })
</script>

<svelte:window {onkeydown} />

<Head page={{ title: 'Project Dex', path: '/dex/' }} />

<div class="dex-page">
  <div class="dex-head">
    <h1>Project Dex</h1>
    <p>Everything I've built that's public, numbered roughly by how much of me went into it. Each entry's flower is grown from its name, and each has a partner.</p>
    <div class="dex-count">
      <span>Seen <b>{projects.length}</b></span>
      <span><i class="kn" aria-hidden="true"></i>Written up <b>{written}</b></span>
      <span>Live <b>{live}</b></span>
    </div>
  </div>

  <div class="tab-menu" use:satinSelect={{ items: 'button', selected: tabs.indexOf(tab) }} bind:this={tabsEl}>
    <div class="sel-bar" aria-hidden="true"></div>
    <!-- satinSelect only re-measures on resize, and pointerleave makes it re-seat the bar -->
    <div class="tabs" role="tablist" aria-label="Project types" onscroll={() => tabsEl?.dispatchEvent(new Event('pointerleave'))}>
      {#each tabs as t (t)}
        <button
          type="button"
          role="tab"
          aria-selected={t === tab}
          aria-controls="dex-list"
          tabindex={t === tab ? 0 : -1}
          onclick={() => setTab(t)}>
          {t === 'all' ? 'All' : t}<sup>{count(t)}</sup>
        </button>
      {/each}
    </div>
  </div>

  <div class="pokedex">
    <section class="screen" aria-labelledby="dex-name" bind:this={screenEl}>
      <p class="sr-only" aria-live="polite" aria-atomic="true">{announce}</p>
      <div class="scr-top"><span>Project Dex</span><b>No. {no(cur)}</b></div>
      <div class="hoop">
        <Embroidery compose={hoop} width={200} height={200} speed={1.4} palette={sd.palette} />
        <div class="partner" title={titleCase(entry.partner.name)}><Pokemon pokemonName={entry.partner.name} /></div>
      </div>
      <h2 id="dex-name" tabindex="-1" bind:this={nameEl}>{entry.name}</h2>
      <div class="species">The {entry.category} Project</div>
      <div class="ty">
        {#each entry.tags ?? [] as t (t)}<span>{t}</span>{/each}
      </div>
      <dl class="dex-stats">
        <dt>Stack</dt>
        <dd>{entry.badges?.join(' · ')}</dd>
        <dt>Habitat</dt>
        <dd>
          {#if successor}
            Retired · evolved into <button type="button" class="evolve" onclick={() => evolve(successor.id)}>{successor.name}</button>
          {:else}
            {siteOf(cur) ? 'Live on the web' : 'GitHub'}
          {/if}
        </dd>
        <dt>Partner</dt>
        <dd>{titleCase(entry.partner.name)} <i>· {entry.partner.reason}</i></dd>
        <dt>Flower</dt>
        <dd>{NAMES[species]} <i>· seed {seedLabel(sd.hash)}</i></dd>
      </dl>
      <p class="flavour">{entry.description}</p>
      <div class="links">
        {#if entry.link}<a href={entry.link} rel="noopener noreferrer">source</a>{/if}
        {#if siteOf(cur)}<a href={siteOf(cur)} rel="noopener noreferrer">visit</a>{/if}
        {#if post}<a href={post.path}>field notes: {post.title?.replace(/:.*/, '')}</a>{/if}
      </div>
      <div class="scr-nav">
        <button type="button" onclick={() => step(-1)}>‹ No. {no(shown[(shown.indexOf(cur) - 1 + shown.length) % shown.length])}</button>
        <button type="button" onclick={() => step(1)}>No. {no(shown[(shown.indexOf(cur) + 1) % shown.length])} ›</button>
      </div>
    </section>

    <div>
      {#key tab}
        <div class="list-menu" use:satinSelect={{ items: 'li', selected: shown.indexOf(cur) }} bind:this={listEl}>
          <div class="sel-bar" aria-hidden="true"></div>
          <ol class="dex-list" id="dex-list" aria-label="Entries">
            {#each shown as i (i)}
              {@const p = projects[i]}
              <li id={p.id} class:cur={i === cur}>
                <button type="button" data-i={i} aria-current={i === cur ? 'true' : undefined} onclick={() => pick(i)}>
                  <Specimen seed={p.name} size={60} R={30} leaves={false} speed={2} class="mini" />
                  <span class="dn">{no(i)}</span>
                  <span class="nm">{p.name}{#if p.post}<i class="kn" title="written up"></i>{/if}</span>
                  <span class="tp">{p.tags?.[0]}</span>
                </button>
              </li>
            {/each}
          </ol>
        </div>
      {/key}
      <p class="dex-hint"><kbd>↑</kbd> <kbd>↓</kbd> to flick through, <kbd>←</kbd> <kbd>→</kbd> to change type, like the real thing.</p>
    </div>
  </div>
</div>

<style>
  .dex-head { margin: 4.5rem 0 1.2rem; }
  .dex-head h1 { font-size: 2.6rem; margin: 0 0 0.6rem; font-weight: 400; }
  .dex-head p { color: var(--fg2); margin: 0; max-width: var(--measure); }
  .dex-count { font-family: var(--mono); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-top: 1rem; display: flex; gap: 1.4rem; flex-wrap: wrap; }
  .dex-count b { color: var(--fg); font-weight: 500; }
  .kn { display: inline-block; border-radius: 50%; background: var(--g1); }
  .dex-count .kn { width: 7px; height: 7px; margin-right: 0.35rem; vertical-align: 0.05em; }

  .tabs { display: flex; flex-wrap: wrap; gap: 0.1rem; margin: 0 0 2.2rem -1rem; }
  .tabs button { background: none; border: 0; padding: 0.3rem 1rem; font-family: var(--mono); font-size: 12.5px; color: var(--muted); cursor: pointer; }
  .tabs button[aria-selected='true'] { color: var(--fg); text-decoration: underline dashed var(--g1); text-underline-offset: 4px; }
  .tabs sup { font-size: 9.5px; margin-left: 0.2rem; opacity: 0.75; }

  /* a "screen" (an embroidery hoop holding the entry's flower) beside a numbered list */
  .pokedex { display: grid; grid-template-columns: minmax(0, 25rem) minmax(0, 1fr); gap: var(--gap); align-items: start; max-width: calc(var(--measure) + var(--gap) + var(--margin)); }
  .screen { position: sticky; top: 1.5rem; border: 1px solid color-mix(in srgb, var(--fg2) 70%, transparent); border-radius: 14px; padding: 1.1rem 1.2rem 1.2rem;
    background: repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 3.5%, transparent) 3px 4px), repeating-linear-gradient(-45deg, transparent 0 3px, color-mix(in srgb, var(--fg) 2.5%, transparent) 3px 4px), var(--panel); }
  .scr-top { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .scr-top b { color: var(--r3); font-weight: 500; }
  .hoop { position: relative; width: min(17rem, 100%); aspect-ratio: 1; margin: 0.7rem auto 0.4rem; border-radius: 50%;
    background: radial-gradient(circle at 50% 45%, var(--bg) 0 60%, color-mix(in srgb, var(--bg) 85%, var(--panel)) 100%);
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--g1) 70%, var(--panel)), 0 0 0 6px var(--g2), inset 0 0 0 1px var(--rule), 0 10px 22px -16px color-mix(in srgb, var(--fg) 60%, transparent); }
  .hoop::before { content: ''; position: absolute; left: 50%; top: -13px; width: 20px; height: 12px; transform: translateX(-50%); border-radius: 3px 3px 1px 1px; background: var(--g2); box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--g1) 60%, transparent); }
  .hoop :global(svg) { position: absolute; inset: 6%; width: 88%; height: 88%; }
  .partner { position: absolute; right: -14px; bottom: -6px; transform: scale(1.25); transform-origin: bottom right; filter: drop-shadow(0 2px 0 color-mix(in srgb, var(--fg) 12%, transparent)); }
  .partner :global(.sprite-wrapper) { margin: 0; display: block; }
  .partner :global(.pokesprite) { display: block; }
  .screen h2 { font-family: var(--mono); font-size: 1.05rem; font-weight: 500; margin: 0.8rem 0 0.1rem; letter-spacing: 0; word-break: break-word; }
  .screen h2:focus { outline: none; }
  .species { font-size: 15px; font-style: italic; color: var(--muted); margin-bottom: 0.55rem; }
  .ty { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .ty span { font-family: var(--mono); font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 3px; padding: 0.05rem 0.45rem; color: var(--sel-ink); background: var(--r3); }
  .ty span:nth-child(2n) { background: var(--g2); }
  .dex-stats { display: grid; grid-template-columns: max-content 1fr; gap: 0.3rem 0.9rem; margin: 0.9rem 0; padding: 0.7rem 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); font-size: 14.5px; line-height: 1.4; }
  .dex-stats dt { font-family: var(--mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); padding-top: 0.2rem; }
  .dex-stats dd { margin: 0; color: var(--fg2); }
  .dex-stats dd i { color: var(--muted); }
  .evolve { font: inherit; color: var(--r3); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
  .flavour { margin: 0 0 0.9rem; font-size: 16px; line-height: 1.5; color: var(--fg); }
  .links { display: flex; gap: 1rem; font-family: var(--mono); font-size: 12px; flex-wrap: wrap; }
  .links a { color: var(--link); }
  .scr-nav { display: flex; justify-content: space-between; margin-top: 1rem; }
  .scr-nav button { background: none; border: 0; color: var(--muted); cursor: pointer; padding: 0; font-family: var(--mono); font-size: 11.5px; }
  .scr-nav button:hover { color: var(--fg); }

  .dex-list { list-style: none; padding: 0; margin: 0; }
  .dex-list li { margin: 0 -0.9rem; }
  .dex-list button { display: grid; grid-template-columns: 30px 3.2rem 1fr auto; align-items: center; gap: 0.5rem; width: 100%; padding: 0.32rem 0.9rem; background: none; border: 0; font: inherit; color: inherit; text-align: left; cursor: pointer; }
  .dex-list :global(.mini) { width: 30px; height: 30px; }
  .dn { font-family: var(--mono); font-size: 11.5px; color: var(--muted); }
  .nm { font-family: var(--mono); font-size: 13.5px; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nm .kn { width: 6px; height: 6px; margin-left: 0.45rem; vertical-align: 0.15em; }
  .tp { font-family: var(--mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
  .dex-list li.cur .nm { text-decoration: underline dashed var(--g1); text-underline-offset: 4px; }
  .dex-list li:global(.is-sel) .kn { background: var(--sel-ink); }
  .dex-hint { font-family: var(--mono); font-size: 11.5px; color: var(--muted); margin-top: 1rem; }
  .dex-hint kbd { font-size: 10.5px; padding: 0 0.3rem; color: var(--fg2); }

  @media (max-width: 59.99rem) {
    .pokedex { grid-template-columns: 1fr; }
    .screen { position: relative; top: 0; scroll-margin-top: 1rem; }
  }
  @media (max-width: 40rem) {
    .tab-menu { overflow: hidden; margin-right: -1.25rem; }
    .tabs { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin-bottom: 1.6rem; }
    .tabs::-webkit-scrollbar { display: none; }
    .tabs button { white-space: nowrap; flex: none; }
    .hoop { width: 13rem; }
    .dex-list button { grid-template-columns: 30px 2.6rem 1fr; }
    .tp { display: none; }
  }
</style>
