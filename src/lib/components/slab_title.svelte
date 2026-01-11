<script lang="ts">
  export let title: string
  export let slug: string = ''
  export let config: string = '' // e.g. "4c 3i 5ci 2.5" - size + c(colored) + i(italic)
  export let href: string = ''
  export let center: boolean = true
  
  // DaisyUI accent colors
  const accentColors = [
    'text-primary',
    'text-secondary', 
    'text-accent',
    'text-info',
    'text-success',
    'text-warning',
    'text-error'
  ]
  
  // Grayscale colors
  const grayscaleColors = [
    'text-base-content',
    'text-base-content/80',
    'text-base-content/60'
  ]
  
  interface WordConfig {
    size: number
    colored: boolean
    italic: boolean
  }
  
  // Simple hash function for deterministic colors
  function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }
  
  $: words = title.split(' ')
  $: safePath = slug.split('/').pop() || slug || 'title'
  
  // Auto-generate interesting config based on title when none provided
  function autoGenerateConfig(words: string[], path: string): WordConfig[] {
    const baseHash = hashCode(path)
    return words.map((word, i) => {
      const wordHash = hashCode(word + i + path)
      // Vary sizes between 2 and 3.5 rem based on word length and position
      const baseSize = 2.2 + (word.length > 6 ? 0.3 : word.length > 3 ? 0.6 : 0.8)
      const sizeVariation = ((wordHash % 5) - 2) * 0.15
      const size = Math.max(1.8, Math.min(3.5, baseSize + sizeVariation))
      // Color ~40% of words, prefer coloring shorter/punchier words
      const colored = (wordHash % 10) < (word.length < 5 ? 5 : 3)
      // Italicize ~20% of words
      const italic = (wordHash % 10) > 7
      return { size, colored, italic }
    })
  }
  
  // Parse config string like "4c 3i 5ci 2.5" or auto-generate
  $: wordConfigs = config
    ? config.split(/\s+/).filter(Boolean).map(cfg => {
        const sizeMatch = cfg.match(/^([\d.]+)/)
        const size = sizeMatch ? parseFloat(sizeMatch[1]) : 2.5
        const colored = cfg.includes('c')
        const italic = cfg.includes('i')
        return { size, colored, italic }
      })
    : autoGenerateConfig(words, safePath)
  
  function getColorClass(index: number, colored: boolean): string {
    const h = hashCode(safePath + index)
    if (colored) {
      return accentColors[h % accentColors.length]
    }
    return grayscaleColors[h % grayscaleColors.length]
  }
  
  function getWeight(index: number, italic: boolean): number {
    const h = hashCode(safePath + index)
    return italic ? [300, 400, 500][h % 3] : 900
  }
  
  // Pre-compute styled words for template
  $: styledWords = words.map((word, i) => {
    const wordConfig = wordConfigs[i] ?? { size: 2.5, colored: false, italic: false }
    return {
      word,
      colorClass: getColorClass(i, wordConfig.colored),
      fontWeight: getWeight(i, wordConfig.italic),
      size: wordConfig.size,
      italic: wordConfig.italic
    }
  })
</script>

{#if href}
  <a {href} class="block outline-none">
    <h2 class="flex flex-wrap items-baseline gap-x-3 gap-y-1 {center ? 'justify-center' : 'justify-start'}">
      {#each styledWords as { word, colorClass, fontWeight, size, italic }}
        <span
          class="leading-none uppercase {colorClass}"
          class:italic
          class:font-mono={!italic}
          style="font-size: {size}rem; font-weight: {fontWeight};"
        >
          {word}
        </span>
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
        style="font-size: {size}rem; font-weight: {fontWeight};"
      >
        {word}
      </span>
    {/each}
  </h1>
{/if}

