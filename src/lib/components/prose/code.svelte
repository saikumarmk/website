<!--
  Annotated Python: the file's comments and docstrings are the prose, beside the code they explain.
  `/annotations/<name>.json` is rendered at build time (Markdown, KaTeX and Shiki), so this only fetches HTML.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { whenNear } from '$lib/actions/when-near'
  import type { RenderedSection } from './parse-python-sections'

  let { sourceUrl = '', title = '' }: { sourceUrl?: string; title?: string } = $props()

  const SHOW = 6
  const uid = `an-${Math.random().toString(36).slice(2, 9)}`

  let host = $state<HTMLElement>()
  let sections = $state<RenderedSection[] | null>(null)
  let failed = $state(false)
  let open = $state(false)

  let name = $derived(sourceUrl.match(/\/annotations\/([\w-]+)\.py$/)?.[1])
  let label = $derived(title || (name ? `${name}.py` : 'Annotated code'))
  let hidden = $derived(sections ? Math.max(0, sections.length - SHOW) : 0)

  async function load() {
    try {
      if (!name) throw new Error(`not an annotations file: ${sourceUrl}`)
      const res = await fetch(`/annotations/${name}.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      sections = (await res.json()).sections
    } catch (e) {
      console.error('[annotated code]', e)
      failed = true
    }
  }

  function toggle() {
    open = !open
    if (!open) host?.scrollIntoView({ block: 'nearest' })
  }

  onMount(() => whenNear(host!, load))
</script>

{#snippet row(s: RenderedSection)}
  <div class="an-sec">
    <div class="an-docs">{@html s.docs}</div>
    <div class="an-code">{@html s.code}</div>
  </div>
{/snippet}

<div class="annotated wide not-prose" bind:this={host}>
  <div class="an-title">
    <span>{label}</span>
    <span>
      {#if failed}couldn't load the source ·
      {:else if sections}{sections.length} sections · python ·
      {:else}loading… ·
      {/if}
      <a href={sourceUrl}>source</a>
    </span>
  </div>
  {#if sections}
    {#each sections.slice(0, SHOW) as s}{@render row(s)}{/each}
    {#if hidden}
      <div id="{uid}-rest" hidden={!open}>
        {#each sections.slice(SHOW) as s}{@render row(s)}{/each}
      </div>
      <button class="an-more" type="button" aria-expanded={open} aria-controls="{uid}-rest" onclick={toggle}>
        {open ? 'show fewer' : `show the other ${hidden} sections`}
      </button>
    {/if}
  {/if}
</div>

<style>
  .annotated {
    margin-block: 1.8rem;
    border-top: 1px solid var(--rule);
  }
  .an-title {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--c2);
    padding: 0.7rem 0 0.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.2rem 1rem;
  }
  .an-title span:last-child {
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: none;
    white-space: nowrap;
  }
  .an-sec {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 0 1.4rem;
    border-top: 1px dashed var(--rule);
  }
  .an-docs {
    padding: 0.9rem 0;
    font-size: 15.5px;
    line-height: 1.55;
    color: var(--fg2);
    min-width: 0;
  }
  .an-docs > :global(:first-child) {
    margin-top: 0;
  }
  .an-docs > :global(:last-child) {
    margin-bottom: 0;
  }
  .an-docs :global(:is(h3, h4)) {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0.2rem 0 0.5rem;
    color: var(--fg);
  }
  .an-docs :global(:is(p, ul, ol)) {
    margin: 0 0 0.7rem;
  }
  .an-docs :global(:is(ul, ol)) {
    padding-left: 1.2rem;
  }
  .an-docs :global(ul) {
    list-style: disc;
  }
  .an-docs :global(ol) {
    list-style: decimal;
  }
  .an-docs :global(:not(pre) > code) {
    font-family: var(--mono);
    font-size: 0.8em;
    background: var(--panel);
    padding: 0.1em 0.35em;
    border-radius: 3px;
  }
  .an-docs :global(.katex-display) {
    overflow-x: auto;
    overflow-y: hidden;
    margin: 0.6rem 0;
  }
  .an-code {
    padding: 0.9rem 0;
    min-width: 0;
  }
  .an-code:empty {
    padding: 0;
  }
  .an-code :global(pre.shiki) {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.6;
    padding: 0.8rem 1rem 0.8rem 1.2rem;
  }
  .an-more {
    display: block;
    width: 100%;
    margin-top: 0.4rem;
    padding: 0.55rem;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--muted);
    background: none;
    border: 1px dashed var(--rule);
    border-radius: 8px;
    cursor: pointer;
  }
  .an-more:hover {
    color: var(--fg);
    border-color: var(--g1);
  }
  @media (min-width: 48rem) {
    .an-code :global(pre.shiki) {
      position: sticky;
      top: 1rem;
      max-height: calc(100vh - 2rem);
      overflow: auto;
    }
  }
  @media (max-width: 47.99rem) {
    .an-sec {
      grid-template-columns: minmax(0, 1fr);
    }
    .an-docs {
      padding-bottom: 0.2rem;
    }
  }
</style>
