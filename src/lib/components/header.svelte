<script lang="ts">
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  let { onsearch }: { onsearch?: () => void } = $props()

  type Theme = 'ivory' | 'ink'
  let theme = $state<Theme>('ivory')

  /** `section` links point at a part of the home page and light up while it's in view. */
  const links: { href: string; label: string; match?: (p: string) => boolean; section?: string; wide?: boolean }[] = [
    { href: '/archive', label: 'Writing', match: (p) => p.startsWith('/archive') },
    { href: '/dex', label: 'Dex', match: (p) => p.startsWith('/dex') },
    { href: '/#experience', label: 'Experience', section: 'experience', wide: true },
    { href: '/#about', label: 'About', section: 'about' }
  ]
  const sections = links.flatMap((l) => (l.section ? [l.section] : []))

  let inView = $state<string | null>(null)
  let raf = 0
  function spy() {
    raf = 0
    if (location.pathname !== '/') return (inView = null)
    let current: string | null = null
    let top = -Infinity
    for (const id of sections) {
      const r = document.getElementById(id)?.getBoundingClientRect()
      if (r && r.top < innerHeight * 0.4 && r.bottom > 0 && r.top > top) [current, top] = [id, r.top]
    }
    inView = current
  }
  const soon = () => (raf ||= requestAnimationFrame(spy))
  afterNavigate(soon)

  onMount(() => {
    theme = document.documentElement.dataset.theme === 'ink' ? 'ink' : 'ivory'
    addEventListener('scroll', soon, { passive: true })
    addEventListener('resize', soon)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', soon)
      removeEventListener('resize', soon)
    }
  })

  const current = (l: (typeof links)[number], path: string) =>
    l.section ? (inView === l.section ? 'location' : undefined) : l.match?.(path) ? 'page' : undefined

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
      <a href={l.href} class:wide-only={l.wide} aria-current={current(l, $page.url.pathname)}>{l.label}</a>
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
