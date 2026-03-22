<script lang="ts">
  let { title, slug = '', config = '', href = '', center = true } = $props()

  const accentColors = [
    'text-primary',
    'text-secondary',
    'text-accent',
    'text-info',
    'text-success',
    'text-warning',
    'text-error'
  ]

  const grayscaleColors = ['text-base-content', 'text-base-content/80', 'text-base-content/60']

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

  let words = $derived(title.split(' '))
  let safePath = $derived(slug.split('/').pop() || slug || 'title')

  function autoGenerateConfig(w: string[], path: string): WordConfig[] {
    return w.map((word, i) => {
      const wordHash = hashCode(word + i + path)
      const baseSize = 2.2 + (word.length > 6 ? 0.3 : word.length > 3 ? 0.6 : 0.8)
      const sizeVariation = ((wordHash % 5) - 2) * 0.15
      const size = Math.max(1.8, Math.min(3.5, baseSize + sizeVariation))
      const colored = (wordHash % 10) < (word.length < 5 ? 5 : 3)
      const italic = (wordHash % 10) > 7
      return { size, colored, italic }
    })
  }

  let wordConfigs = $derived(
    config
      ? config.split(/\s+/).filter(Boolean).map(cfg => {
          const sizeMatch = cfg.match(/^([\d.]+)/)
          const size = sizeMatch ? parseFloat(sizeMatch[1]) : 2.5
          return { size, colored: cfg.includes('c'), italic: cfg.includes('i') }
        })
      : autoGenerateConfig(words, safePath)
  )

  function getColorClass(index: number, colored: boolean): string {
    const h = hashCode(safePath + index)
    return colored ? accentColors[h % accentColors.length] : grayscaleColors[h % grayscaleColors.length]
  }

  function getWeight(index: number, italic: boolean): number {
    const h = hashCode(safePath + index)
    return italic ? [300, 400, 500][h % 3] : 900
  }

  let styledWords = $derived(
    words.map((word: string, i: number) => {
      const wordConfig = wordConfigs[i] ?? { size: 2.5, colored: false, italic: false }
      return {
        word,
        colorClass: getColorClass(i, wordConfig.colored),
        fontWeight: getWeight(i, wordConfig.italic),
        size: wordConfig.size,
        italic: wordConfig.italic
      }
    })
  )
</script>

{#if href}
  <a {href} class="block outline-none">
    <h2 class="flex flex-wrap items-baseline gap-x-3 gap-y-1 {center ? 'justify-center' : 'justify-start'}">
      {#each styledWords as { word, colorClass, fontWeight, size, italic }}
        <span
          class="leading-none uppercase {colorClass}"
          class:italic
          class:font-mono={!italic}
          style="font-size: {size}rem; font-weight: {fontWeight};">{word}</span>
      {/each}
    </h2>
  </a>
{:else}
  <h1 class="flex flex-wrap items-baseline gap-x-3 gap-y-1 {center ? 'justify-center' : 'justify-start'}">
    {#each styledWords as { word, colorClass, fontWeight, size, italic }}
      <span
        class="leading-none uppercase {colorClass}"
        class:italic
        class:font-mono={!italic}
        style="font-size: {size}rem; font-weight: {fontWeight};">{word}</span>
    {/each}
  </h1>
{/if}
