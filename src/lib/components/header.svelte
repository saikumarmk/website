<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  let { onsearch }: { onsearch?: () => void } = $props()

  type Theme = 'ivory' | 'ink'
  let theme = $state<Theme>('ivory')

  const links: { href: string; label: string; match: (p: string) => boolean; wide?: boolean }[] = [
    { href: '/archive', label: 'Writing', match: (p) => p.startsWith('/archive') },
    { href: '/portfolio/projects', label: 'Dex', match: (p) => p.startsWith('/portfolio/projects') },
    { href: '/portfolio', label: 'Experience', match: (p) => /^\/portfolio\/?$/.test(p), wide: true },
    { href: '/about', label: 'About', match: (p) => p.startsWith('/about') }
  ]

  onMount(() => {
    theme = document.documentElement.dataset.theme === 'ink' ? 'ink' : 'ivory'
  })

  function toggleTheme() {
    theme = theme === 'ink' ? 'ivory' : 'ink'
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }
</script>

<header class="site">
  <a class="name" href="/">Sai Kumar M.K.</a>
  <nav aria-label="Site">
    {#each links as l (l.href)}
      <a href={l.href} class:wide-only={l.wide} aria-current={l.match($page.url.pathname) ? 'page' : undefined}>{l.label}</a>
    {/each}
    <button class="search-btn" type="button" onclick={() => onsearch?.()}>Search <kbd class="wide-only">⌘K</kbd></button>
    <button
      class="theme-btn"
      type="button"
      onclick={toggleTheme}
      aria-label="Switch to {theme === 'ink' ? 'ivory (light)' : 'ink (dark)'} theme"
      title="ivory / ink">
      <span class="wide-only" aria-hidden="true">ivory / ink</span><span class="narrow-only" aria-hidden="true">◐</span>
    </button>
  </nav>
</header>
