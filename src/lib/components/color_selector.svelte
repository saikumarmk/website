<script lang="ts">
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { backgroundMode } from '$lib/stores/background'

  type BgMode = 'none' | 'three' | 'poke'

  let {
    themes = [],
    onchange
  }: {
    themes?: { name: string; text?: string }[]
    onchange?: (theme: string) => void
  } = $props()

  let currentTheme = $state('dark')
  let currentAccent = $state('purple')
  const backgrounds: { value: BgMode; label: string; icon: string }[] = [
    { value: 'none', label: 'None', icon: 'i-heroicons-outline-x-mark' },
    { value: 'three', label: 'Astro', icon: 'i-heroicons-outline-sparkles' },
    { value: 'poke', label: 'Pokémon', icon: 'i-heroicons-outline-cube-transparent' }
  ]
  const accents = [
    { value: 'blue', label: 'Blue', color: 'hsl(211 100% 74%)' },
    { value: 'purple', label: 'Purple', color: 'hsl(260 100% 83%)' },
    { value: 'orange', label: 'Orange', color: 'hsl(28 100% 70%)' }
  ]

  onMount(() => {
    if (browser) {
      const storedTheme = localStorage.getItem('theme')
      currentTheme = storedTheme && themes.some(t => t.name === storedTheme) ? storedTheme : 'dracula'
      currentAccent = localStorage.getItem('editorial-accent') ?? 'purple'
      document.documentElement.dataset.editorialAccent = currentAccent
    }
  })

  function selectTheme(theme: string) {
    currentTheme = theme
    if (browser) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
      onchange?.(theme)
    }
  }

  function selectBackground(value: BgMode) {
    backgroundMode.set(value)
  }

  function selectAccent(value: string) {
    currentAccent = value
    if (browser) {
      document.documentElement.dataset.editorialAccent = value
      localStorage.setItem('editorial-accent', value)
    }
  }
</script>

<div class="p-3">
  <h3 class="text-sm font-semibold mb-3 flex items-center gap-2 text-base-content">
    <span class="i-heroicons-outline-swatch w-4 h-4 text-primary"></span>
    Mode
  </h3>

  <div class="grid grid-cols-2 gap-2">
    {#each themes as themeItem}
      {@const isSelected = currentTheme === themeItem.name}
      <button
        data-theme={themeItem.name}
        aria-label="Select {themeItem.text ?? themeItem.name} theme"
        title={themeItem.text ?? themeItem.name}
        onclick={() => selectTheme(themeItem.name)}
        class="mode-button {isSelected ? 'selected' : ''}"
      >
        <span class="{themeItem.name === 'cmyk' ? 'i-heroicons-outline-sun' : 'i-heroicons-outline-moon'} w-5 h-5"></span>
        <span>{themeItem.text ?? themeItem.name}</span>
      </button>
    {/each}
  </div>

  <p class="text-xs text-base-content/60 mt-2 text-center">
    {themes.find(theme => theme.name === currentTheme)?.text ?? 'Dark'}
  </p>

  <div class="divider my-2 h-px"></div>

  <h3 class="text-sm font-semibold mb-2 flex items-center gap-2 text-base-content">
    <span class="i-heroicons-outline-sparkles w-4 h-4 text-primary"></span>
    Accent
  </h3>

  <div class="grid grid-cols-3 gap-2">
    {#each accents as accent}
      {@const isSelected = currentAccent === accent.value}
      <button
        onclick={() => selectAccent(accent.value)}
        class="flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150
          {isSelected
            ? 'bg-primary/20 ring-2 ring-primary ring-offset-1 ring-offset-base-100'
            : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'}"
        title="{accent.label} accent"
      >
        <span class="w-5 h-5 rounded-full border border-base-content/20" style={`background:${accent.color};`}></span>
        <span class="text-[10px] font-medium {isSelected ? 'text-primary' : 'opacity-70'}">{accent.label}</span>
      </button>
    {/each}
  </div>

  <div class="divider my-2 h-px"></div>

  <h3 class="text-sm font-semibold mb-2 flex items-center gap-2 text-base-content">
    <span class="i-heroicons-outline-photo w-4 h-4 text-secondary"></span>
    Background
  </h3>

  <div class="flex gap-2">
    {#each backgrounds as bg}
      {@const isSelected = $backgroundMode === bg.value}
      <button
        onclick={() => selectBackground(bg.value)}
        class="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150
          {isSelected
            ? 'bg-primary/20 ring-2 ring-primary ring-offset-1 ring-offset-base-100'
            : 'bg-base-200 hover:bg-base-300 opacity-70 hover:opacity-100'}"
        title={bg.label}
      >
        <span class="{bg.icon} w-5 h-5 {isSelected ? 'text-primary' : ''}"></span>
        <span class="text-[10px] font-medium {isSelected ? 'text-primary' : 'opacity-70'}">{bg.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .mode-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
    padding: 0.6rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    opacity: 0.76;
    transition: 0.15s;
  }

  .mode-button:hover,
  .mode-button.selected {
    opacity: 1;
    border-color: hsl(var(--p));
    color: hsl(var(--p));
    background: hsl(var(--p) / 0.12);
  }
</style>
