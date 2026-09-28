<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { page } from '$app/stores'
  import { seeded, type Builder } from '$lib/thread'
  import { openSearch } from '$lib/search/open'
  import Head from '$lib/components/head.svelte'
  import Embroidery from '$lib/components/thread/Embroidery.svelte'

  /** When the root layout fails, `$page` / `get(page)` is not available — avoid a second crash. */
  function readPage() {
    try {
      return get(page)
    } catch {
      return null
    }
  }

  let p = $state(readPage())
  onMount(() => {
    try {
      return page.subscribe(v => (p = v))
    } catch {}
  })

  const status = $derived(p?.status ?? 500)
  const errMsg = $derived(p?.error?.message ?? 'Something went wrong')
  const path = $derived(p?.url?.pathname ?? '/')
  const sd = $derived(seeded(path))

  const f = (n: number) => +n.toFixed(1)
  /** the flower the missing path would have grown, left unfinished, with the working thread hanging loose */
  const unravel = (b: Builder, W: number, H: number) => {
    const cx = W * 0.44
    const cy = H * 0.4
    b.specimen(cx, cy, 70, seeded(path).rng, { box: [W, H * 0.8] })
    const t = b.tick(200)
    b.raw(
      `<path class="loose run" style="--d:${t}ms" d="M${f(cx + 30)} ${f(cy + 40)} C ${f(cx + 90)} ${f(cy + 120)}, ${f(W * 0.62)} ${f(H * 0.98)}, ${f(W * 0.8)} ${f(H * 0.8)} S ${f(W * 0.97)} ${f(H * 0.52)}, ${f(W * 0.9)} ${f(H * 0.42)}"/>`
    )
    b.raw(
      `<g class="needle run" style="--d:${t + 200}ms"><path d="M${f(W * 0.9)} ${f(H * 0.42)} L${f(W * 0.86)} ${f(H * 0.16)}"/><ellipse cx="${f(W * 0.863)}" cy="${f(H * 0.19)}" rx="1.4" ry="4" transform="rotate(-8 ${f(W * 0.863)} ${f(H * 0.19)})"/></g>`
    )
  }

  const searchFor = () => {
    let q: string = path
    try {
      q = decodeURIComponent(path)
    } catch {}
    openSearch(q.replace(/[-_/]+/g, ' ').trim())
  }
</script>

<Head page={{ title: String(status), path }} />

{#if status === 404}
  <div class="lost">
    {#key path}
      <Embroidery compose={unravel} width={360} height={280} palette={sd.palette} class="unravel" />
    {/key}
    <div class="col">
      <p class="smallcaps">404 · a dropped stitch</p>
      <h1>Nothing's been sewn here yet.</h1>
      <p>
        There's no page at <code>{path}</code>
        . If there were, that's the flower it would have grown; it didn't get finished. Pull the thread back to
        <a href="/">the start</a>
        , browse
        <a href="/archive">the writing</a>
        , or
        <button type="button" class="linkish" onclick={searchFor}>search</button>
        for it.
      </p>
    </div>
  </div>
{:else}
  <div class="col error-page">
    <p class="smallcaps">Error {status}</p>
    <h1>{errMsg}</h1>
    <p>
      <a href="/">Back to the front page</a>
      ·
      <a href="/archive">All writing</a>
    </p>
  </div>
{/if}

<style>
  .lost {
    display: grid;
    grid-template-columns: minmax(0, var(--measure)) minmax(0, 1fr);
    column-gap: var(--gap);
    margin-top: 3rem;
  }
  .lost .col {
    grid-row: 1;
    grid-column: 1;
    align-self: center;
  }
  .lost :global(.unravel) {
    grid-row: 1;
    grid-column: 2;
    width: 100%;
    max-width: 26rem;
    height: auto;
  }
  .lost h1,
  .error-page h1 {
    font-size: clamp(2.2rem, 4.6vw, 3rem);
    font-weight: 400;
    margin: 0.6rem 0 1rem;
  }
  .lost a,
  .error-page a {
    text-decoration-line: underline;
  }
  .lost code {
    font-family: var(--mono);
    font-size: 0.8em;
    background: var(--panel);
    padding: 0.1em 0.4em;
    border-radius: 3px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 59.99rem) {
    .lost {
      grid-template-columns: 1fr;
    }
    .lost :global(.unravel) {
      grid-row: 1;
      grid-column: 1;
      max-width: 18rem;
      margin: 0 auto -1rem;
    }
    .lost .col {
      grid-row: 2;
    }
  }
  /* unfinished: some petals stop partway, and the working thread hangs loose */
  .lost :global(.unravel .satin:nth-of-type(5n + 2)) {
    stroke-dashoffset: 0.55 !important;
  }
  .lost :global(.unravel .satin:nth-of-type(7n + 3)) {
    stroke-dashoffset: 0.8 !important;
  }
  .lost :global(.unravel .loose) {
    fill: none;
    stroke: var(--r3);
    stroke-width: 1.2;
    stroke-dasharray: 3.4 2.6;
    stroke-linecap: round;
  }
  .lost :global(.unravel .needle) {
    stroke: var(--muted);
    stroke-width: 1.6;
    stroke-linecap: round;
    fill: none;
    stroke-dasharray: none;
  }
  .error-page {
    padding-block: 5rem 3rem;
  }
</style>
