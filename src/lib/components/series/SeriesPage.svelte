<!--
  A series as one stem: a knot per part that fills once you've read it (click to toggle),
  side trips (half parts) branch off it, and appendices sit underneath.
-->
<script lang="ts">
  import { posts } from '$lib/stores/posts'
  import { readSlugs, isRead, setRead } from '$lib/stores/read'
  import { seriesOf } from '$lib/utils/series-posts'
  import { readMins } from '$lib/config/topics'
  import Specimen from '$lib/components/thread/Specimen.svelte'

  let { key, title, dek }: { key: string; title: string; dek: string } = $props()

  const series = $derived(seriesOf(key, $posts ?? []))
  const parts = $derived(series.parts)
  const read = $derived((p: Blog.Post) => isRead($readSlugs, p.path))
  const next = $derived(parts.find((p) => !read(p.post)))
  const nRead = $derived(parts.filter((p) => read(p.post)).length)
  const faq = $derived(parts.find((p) => p.part === 0))
  const showFaq = $derived(!!faq && !!next && next !== faq && !read(faq.post))

  const totalMins = $derived(Math.round(parts.reduce((a, p) => a + (p.post.words ?? 0), 0) / 230))
  const revised = $derived(
    parts.map((p) => p.post.updated ?? p.post.published ?? p.post.created).sort((a, b) => Date.parse(a) - Date.parse(b)).pop()
  )
  const fmt = (d?: string, month: 'long' | 'short' = 'long') =>
    d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month, year: 'numeric', timeZone: 'Australia/Melbourne' }) : ''
</script>

<svelte:head>
  <title>{title} | saikumarmk.com</title>
  <meta name="description" content={dek} />
</svelte:head>

<div class="col">
  <header class="art-head">
    <div class="kicker smallcaps"><a href="/archive">A series</a></div>
    <h1>{title}</h1>
    <p class="dek">{dek}</p>
    {#if parts.length}
      <div class="meta">{parts.length} parts · about {totalMins} min · last revised {fmt(revised, 'short')}</div>
    {/if}
  </header>

  {#if parts.length}
    <div class="cta">
      {#if !nRead}
        <a class="go" href={parts[0].post.path}>Start with {parts[0].label} · {readMins(parts[0].post.words)} min</a>
      {:else if next}
        <a class="go" href={next.post.path}>Continue: {next.label} · {readMins(next.post.words)} min</a>
        <span>{nRead} of {parts.length} read</span>
      {:else}
        <span>You've read the whole series.</span>
        <button class="pill" type="button" onclick={() => parts.forEach((p) => setRead(p.post.path, false))}>start over</button>
      {/if}
      {#if showFaq && faq}<span>or <a class="plain" href={faq.post.path}>the FAQ</a> first</span>{/if}
    </div>

    <ol class="stem">
      {#each parts as p (p.post.path)}
        {@const done = read(p.post)}
        <li class:side={p.side}>
          <button
            class="kn"
            class:read={done}
            type="button"
            aria-pressed={done}
            aria-label="{p.label} read"
            title={done ? 'Mark unread' : 'Mark read'}
            onclick={() => setRead(p.post.path, !done)}>{p.mark}</button>
          <div>
            <div class="pt">{[p.label, p.post.series_topic].filter(Boolean).join(' · ')}{p.side ? ', a side trip' : ''}</div>
            <h2><a href={p.post.path}>{p.short}</a></h2>
            {#if p.post.summary}<p>{p.post.summary}</p>{/if}
            <div class="mt">{readMins(p.post.words)} min · {fmt(p.post.published ?? p.post.created, 'short')}</div>
          </div>
          <Specimen seed={p.post.seed ?? p.post.path} width={130} height={96} R={32} cy={0.42} fit={false} class="stem-bloom" />
        </li>
      {/each}
    </ol>

    {#each series.appendix as a (a.path)}
      <p class="also">Appendix: <a href={a.path}>{a.title}</a>, {readMins(a.words)} min.</p>
    {/each}
  {/if}
</div>

<style>
  .cta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin: -1.5rem 0 2.2rem;
    font-size: 16px;
    color: var(--muted);
  }
  .cta .plain {
    color: var(--link);
    text-decoration-color: var(--rule);
  }
  .go {
    font-family: var(--mono);
    font-size: 13px;
    text-decoration: none;
    color: var(--sel-ink);
    background: var(--sel);
    padding: 0.35rem 0.9rem 0.4rem;
    clip-path: polygon(0.6rem 0, 100% 0, calc(100% - 0.6rem) 100%, 0 100%);
  }
  .go:hover {
    color: var(--sel-ink);
  }
  .stem {
    list-style: none;
    margin: 0;
    padding: 0;
    position: relative;
  }
  .stem::before {
    content: '';
    position: absolute;
    left: 1.05rem;
    top: 0.8rem;
    bottom: 2.4rem;
    border-left: 1.5px dashed var(--g2);
  }
  .stem li {
    position: relative;
    display: grid;
    grid-template-columns: 2.9rem 1fr auto;
    gap: 0 1rem;
    padding: 0.7rem 0 1.1rem;
  }
  .stem li.side {
    margin-left: 2.6rem;
    grid-template-columns: 2.3rem 1fr auto;
  }
  .stem li.side::before {
    content: '';
    position: absolute;
    left: -1.55rem;
    top: -0.2rem;
    width: 2rem;
    height: 1.6rem;
    border-left: 1.5px dashed var(--g2);
    border-bottom: 1.5px dashed var(--g2);
    border-bottom-left-radius: 1.4rem;
  }
  .kn {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    border: 1.5px solid var(--g1);
    background: var(--bg);
    display: grid;
    place-items: center;
    font-family: var(--mono);
    font-size: 10.5px;
    color: var(--g2);
    cursor: pointer;
    padding: 0;
    position: relative;
    z-index: 1;
  }
  li.side .kn {
    width: 1.6rem;
    height: 1.6rem;
    font-size: 9px;
  }
  .kn.read {
    background: var(--g1);
    color: var(--sel-ink);
  }
  .kn:hover {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--g1) 30%, transparent);
  }
  .pt {
    font-family: var(--mono);
    font-size: 11.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--c2);
  }
  .stem h2 {
    font-size: 1.3rem;
    font-weight: 500;
    margin: 0.1rem 0 0.25rem;
  }
  .stem h2 a {
    text-decoration: none;
  }
  .stem p {
    margin: 0;
    font-size: 16px;
    color: var(--muted);
    font-style: italic;
    line-height: 1.45;
  }
  .mt {
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--muted);
    margin-top: 0.35rem;
  }
  .stem :global(.stem-bloom) {
    width: 9rem;
    height: 6.65rem;
    align-self: center;
    margin: -1.4rem -1.6rem -1.4rem -1rem;
  }
  .also {
    font-size: 16px;
    color: var(--muted);
    margin: 0.4rem 0 0 3.9rem;
  }
  @media (max-width: 40rem) {
    .stem li {
      grid-template-columns: 2.6rem 1fr 4.2rem;
      gap: 0 0.6rem;
    }
    .stem li.side {
      margin-left: 1.6rem;
      grid-template-columns: 2.2rem 1fr 4.2rem;
    }
    .stem li.side::before {
      left: -0.55rem;
      width: 1rem;
    }
    .stem :global(.stem-bloom) {
      width: 5.4rem;
      height: 4rem;
      margin: -0.6rem -1.2rem 0 -0.4rem;
      align-self: start;
    }
  }
</style>
