<script lang="ts">
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { backgroundMode } from '$lib/stores/background'
  
  const dispatch = createEventDispatcher<{ change: string }>()
  
  // DaisyUI themes with their primary colors for the swatches
  // These are the themes from your config
  export let themes: { name: string; text?: string }[] = []
  
  let currentTheme = 'dark'
  let selectedIndex = 0
  
  // Background options
  const backgrounds = [
    { value: 'none', label: 'None', icon: 'i-heroicons-outline-x-mark' },
    { value: 'three', label: 'Astro', icon: 'i-heroicons-outline-sparkles' },
    { value: 'poke', label: 'Pokémon', icon: 'i-heroicons-outline-cube-transparent' }
  ]
  
  // Calculate grid position for the animated ring (5 columns)
  $: cols = Math.min(themes.length, 5)
  $: row = Math.floor(selectedIndex / cols)
  $: col = selectedIndex % cols
  
  onMount(() => {
    if (browser) {
      currentTheme = localStorage.getItem('theme') ?? 'dark'
      selectedIndex = themes.findIndex(t => t.name === currentTheme)
      if (selectedIndex === -1) selectedIndex = 0
    }
  })
  
  function selectTheme(theme: string, index: number) {
    currentTheme = theme
    selectedIndex = index
    if (browser) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
      dispatch('change', theme)
    }
  }
  
  function selectBackground(value: string) {
    backgroundMode.set(value)
  }
</script>

<div class="p-3">
  <h3 class="text-sm font-semibold mb-3 flex items-center gap-2 text-base-content">
    <span class="i-heroicons-outline-swatch w-4 h-4 text-primary"></span>
    Theme
  </h3>
  
  <div class="relative grid gap-2" style="grid-template-columns: repeat({cols}, 1fr);">
    {#each themes as themeItem, i}
      {@const isSelected = currentTheme === themeItem.name}
      <button
        data-theme={themeItem.name}
        aria-label="Select {themeItem.text ?? themeItem.name} theme"
        title={themeItem.text ?? themeItem.name}
        on:click={() => selectTheme(themeItem.name, i)}
        class="aspect-square w-full min-w-8 min-h-8 rounded-lg shadow-sm transition-all duration-150 overflow-hidden
          {isSelected ? 'scale-105' : 'opacity-80 hover:scale-110 hover:opacity-100'}"
      >
        <!-- Color swatch showing theme's primary/secondary/accent -->
        <div class="w-full h-full flex">
          <div class="flex-1 bg-primary"></div>
          <div class="flex-1 bg-secondary"></div>
          <div class="flex-1 bg-accent"></div>
        </div>
      </button>
    {/each}
    
    <!-- Animated selection ring -->
    <div
      class="pointer-events-none absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-base-100 transition-all duration-300 ease-out aspect-square"
      style="
        transform: translate(calc({col} * (100% + 0.5rem)), calc({row} * (100% + 0.5rem)));
        width: calc((100% - {cols - 1} * 0.5rem) / {cols});
      "
    ></div>
  </div>
  
  <p class="text-xs text-base-content/60 mt-2 text-center">
    {themes[selectedIndex]?.text ?? themes[selectedIndex]?.name ?? 'Select a theme'}
  </p>
  
  <!-- Divider -->
  <div class="divider my-2 h-px"></div>
  
  <!-- Background Section -->
  <h3 class="text-sm font-semibold mb-2 flex items-center gap-2 text-base-content">
    <span class="i-heroicons-outline-photo w-4 h-4 text-secondary"></span>
    Background
  </h3>
  
  <div class="flex gap-2">
    {#each backgrounds as bg}
      {@const isSelected = $backgroundMode === bg.value}
      <button
        on:click={() => selectBackground(bg.value)}
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
