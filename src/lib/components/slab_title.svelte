<script lang="ts">
  let {
    title,
    slug = '',
    config = '',
    href = '',
    center = false,
    level = 2
  }: { title: string; slug?: string; config?: string; href?: string; center?: boolean; level?: 1 | 2 } = $props()

  const tones = ['r3', 'c2', 'c3', 'g2']

  interface WordConfig {
    size: number
    colored: boolean
    italic: boolean
  }

  function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  let words = $derived(title.split(/\s+/).filter(Boolean))
  let safePath = $derived(slug.split('/').pop() || slug || 'title')

  function autoGenerateConfig(w: string[], path: string): WordConfig[] {
    return w.map((word, i) => {
      const wordHash = hashCode(word + i + path)
      const baseSize = 2.2 + (word.length > 6 ? 0.3 : word.length > 3 ? 0.6 : 0.8)
      const sizeVariation = ((wordHash % 5) - 2) * 0.15
      const size = Math.max(1.8, Math.min(3.5, baseSize + sizeVariation))
      const colored = wordHash % 10 < (word.length < 5 ? 5 : 3)
      const italic = wordHash % 10 > 7
      return { size, colored, italic }
    })
  }

  /** `"3c 2.5 3c 2.5i"`: one entry per word, size in rem, `c` takes a thread colour, `i` sets it in italic. */
  let wordConfigs = $derived(
    config
      ? config
          .split(/\s+/)
          .filter(Boolean)
          .map((cfg): WordConfig => {
            const sizeMatch = cfg.match(/^([\d.]+)/)
            return { size: sizeMatch ? parseFloat(sizeMatch[1]) : 2.5, colored: cfg.includes('c'), italic: cfg.includes('i') }
          })
      : autoGenerateConfig(words, safePath)
  )

  let styledWords = $derived(
    words.map((word, i) => {
      const { size, colored, italic } = wordConfigs[i] ?? { size: 2.5, colored: false, italic: false }
      return { word, size: size * 0.82, italic, tone: colored ? tones[hashCode(safePath + i) % tones.length] : '' }
    })
  )
</script>

{#snippet slab()}
  {#each styledWords as { word, size, italic, tone }}
    <span class={tone ? `t-${tone}` : undefined} class:i={italic} style="font-size: {size}rem">{word}</span>
  {/each}
{/snippet}

{#if href}
  <a {href} class="slab-link">
    <svelte:element this={`h${level}`} class="slab" class:center>{@render slab()}</svelte:element>
  </a>
{:else}
  <svelte:element this={`h${level}`} class="slab" class:center>{@render slab()}</svelte:element>
{/if}

<style>
  .slab {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.1em 0.4em;
    margin: 0 0 1.4rem;
    padding-bottom: 0.7rem;
    font-family: var(--serif);
    line-height: 1;
    color: var(--fg);
    background: linear-gradient(90deg, var(--g2) 50%, transparent 50%) 0 100% / 8px 1.5px repeat-x;
  }
  .slab.center {
    justify-content: center;
  }
  .slab span {
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .slab span.i {
    font-style: italic;
    font-weight: 400;
  }
  .t-r3 {
    color: var(--r3);
  }
  .t-c2 {
    color: var(--c2);
  }
  .t-c3 {
    color: var(--c3);
  }
  .t-g2 {
    color: var(--g2);
  }
  .slab-link {
    display: block;
    text-decoration: none;
  }
</style>
