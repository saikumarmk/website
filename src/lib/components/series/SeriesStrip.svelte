<!-- The series as a thread at the top of a part: where you are, and what you've read. -->
<script lang="ts">
  import { posts } from '$lib/stores/posts'
  import { readSlugs, isRead } from '$lib/stores/read'
  import { seriesOf, seriesKeyOf } from '$lib/utils/series-posts'

  let { post }: { post: Blog.Post } = $props()

  const key = $derived(seriesKeyOf(post))
  const series = $derived(key ? seriesOf(key, $posts ?? []) : undefined)
  const here = $derived(series?.parts.findIndex((p) => p.post.path === post.path) ?? -1)
  const appendix = $derived(!!series?.appendix.some((p) => p.path === post.path))
</script>

{#if series && series.parts.length > 1 && (here >= 0 || appendix)}
  <nav class="strip" aria-label="{series.name}, the series">
    {#if series.href}<a class="nm" href={series.href}>{series.name}</a>{:else}<span class="nm">{series.name}</span>{/if}
    <ol>
      {#each series.parts as p, i (p.post.path)}
        {@const state = i === here ? 'here' : isRead($readSlugs, p.post.path) ? 'read' : ''}
        <li>
          <a
            class="dot {state}"
            href={p.post.path}
            aria-current={i === here ? 'page' : undefined}
            aria-label="{p.label}: {p.short}{state === 'read' ? ' (read)' : ''}"><span>{p.part === 0 ? 'FAQ' : p.part}</span></a>
        </li>
      {/each}
    </ol>
    <span class="where">{here >= 0 ? `${series.parts[here].label} of ${series.parts.length}` : 'Appendix'}</span>
  </nav>
{/if}

<style>
  .strip {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    padding: 0.7rem 1rem 1.5rem;
    margin: -1rem 0 3rem;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    flex-wrap: wrap;
  }
  .nm {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
  }
  a.nm:hover {
    color: var(--fg);
  }
  ol {
    list-style: none;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    flex: 1;
    min-width: 12rem;
    background: linear-gradient(90deg, var(--g2) 50%, transparent 50%) 0 50% / 8px 1.5px repeat-x;
  }
  li {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  li:first-child {
    justify-content: flex-start;
  }
  li:last-child {
    justify-content: flex-end;
  }
  .dot {
    display: block;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 1.5px solid var(--g1);
    background: var(--bg);
    position: relative;
  }
  /* a bigger target than the knot itself */
  .dot::before {
    content: '';
    position: absolute;
    inset: -10px;
  }
  .dot.read {
    background: var(--g1);
  }
  .dot.here {
    width: 17px;
    height: 17px;
    border-color: var(--r3);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--r3) 22%, transparent);
  }
  .dot:hover {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--g1) 30%, transparent);
  }
  .dot span {
    position: absolute;
    top: 1.2rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 9.5px;
    color: var(--muted);
    white-space: nowrap;
  }
  .dot.here span {
    color: var(--r3);
  }
  .where {
    font-size: 15px;
    color: var(--fg2);
  }
  @media (max-width: 40rem) {
    .where {
      width: 100%;
      text-align: right;
    }
  }
</style>
