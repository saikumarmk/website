<!-- The end of a part: the next one, with its flower. -->
<script lang="ts">
  import { posts } from '$lib/stores/posts'
  import { seriesOf, seriesKeyOf } from '$lib/utils/series-posts'
  import { readMins } from '$lib/config/topics'
  import Specimen from '$lib/components/thread/Specimen.svelte'

  let { post }: { post: Blog.Post } = $props()

  const key = $derived(seriesKeyOf(post))
  const series = $derived(key ? seriesOf(key, $posts ?? []) : undefined)
  const here = $derived(series?.parts.findIndex((p) => p.post.path === post.path) ?? -1)
  const next = $derived(series && here >= 0 ? series.parts[here + 1] : undefined)
  const prev = $derived(series && here > 0 ? series.parts[here - 1] : undefined)
</script>

{#if series && next}
  <a class="next" href={next.post.path}>
    <Specimen seed={next.post.seed ?? next.post.path} width={130} height={96} R={32} cy={0.42} fit={false} class="next-bloom" />
    <div>
      <div class="smallcaps">Next in {series.name.replace(/^The /, 'the ')} · {next.label}</div>
      <b>{next.short}</b>
      <p>{[next.post.summary, `${readMins(next.post.words)} min.`].filter(Boolean).join(' ')}</p>
      {#if prev}<div class="prev">‹ before this: {prev.label}, {prev.short}</div>{/if}
    </div>
  </a>
{:else if series?.href && here >= 0}
  <a class="next end" href={series.href}>
    <div>
      <div class="smallcaps">The end of {series.name.replace(/^The /, 'the ')}</div>
      <b>Back to the series</b>
      <p>All {series.parts.length} parts, and which ones you've read.</p>
    </div>
  </a>
{/if}

<style>
  .next {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 1rem;
    align-items: center;
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.9rem 1.2rem;
    margin: 2rem 0 0;
    background: var(--bg);
    text-decoration: none;
    color: inherit;
  }
  .next:hover {
    border-color: var(--g1);
    color: inherit;
  }
  .next.end {
    grid-template-columns: 1fr;
  }
  .next :global(.next-bloom) {
    width: 6.5rem;
    height: 5.2rem;
  }
  .smallcaps {
    color: var(--c2);
  }
  b {
    display: block;
    font-weight: 500;
    font-size: 1.2rem;
    line-height: 1.25;
    margin: 0.2rem 0;
  }
  .next:hover b {
    color: var(--link);
  }
  p {
    margin: 0;
    font-size: 15.5px;
    color: var(--muted);
    font-style: italic;
  }
  .prev {
    font-family: var(--mono);
    font-size: 11.5px;
    color: var(--muted);
    margin-top: 0.5rem;
  }
  @media (max-width: 40rem) {
    .next {
      grid-template-columns: 4.5rem 1fr;
      padding: 0.8rem;
    }
    .next :global(.next-bloom) {
      width: 4.5rem;
      height: 3.6rem;
    }
  }
</style>
