<script lang="ts">
  import { browser, dev } from '$app/environment'
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { site } from '$lib/config/site'
  import { theme } from '$lib/config/general'
  import { title as storedTitle } from '$lib/stores/title'
  import { header as headerConfig } from '$lib/config/general'
  import { hslToHex } from '$lib/utils/color'
  import Nav from '$lib/components/header_nav.svelte'
  import Search from '$lib/components/header_search.svelte'
  import ColorSelector from '$lib/components/color_selector.svelte'

  let { path, searchModal = $bindable(undefined) } = $props()

  let title = $state('')
  let currentTheme = $state('')

  $effect.pre(() => {
    if (!browser) return
    const storedTheme = localStorage.getItem('theme')
    currentTheme =
      storedTheme && theme.some(t => t.name === storedTheme)
        ? storedTheme
        : window.matchMedia('(prefers-color-scheme: dark)').matches ? (theme?.[1].name ?? theme[0].name) : theme[0].name
  })
  let currentThemeColor = $state('')
  let search = $state(false)
  let pin = $state(true)
  let percent = $state(0)
  let scrollY = $state(0)
  let lastY = $state(0)

  let scrollRaf = 0

  $effect(() => {
    const unsub = storedTitle.subscribe(stored => {
      title = stored as string
    })
    return () => unsub()
  })

  $effect(() => {
    if (browser && currentTheme) {
      document.documentElement.setAttribute('data-theme', currentTheme)
      currentThemeColor = hslToHex(
        ...(getComputedStyle(document.documentElement)
          .getPropertyValue('--b1')
          .slice(dev ? 1 : 0)
          .replaceAll('%', '')
          .split(' ')
          .map(Number) as [number, number, number])
      )
    }
  })

  function applyScroll(y: number) {
    const nextPin = lastY - y > 0 || y === 0
    if (nextPin !== pin) pin = nextPin
    lastY = y
    scrollY = y

    if (!browser) return
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const nextPercent = max > 0 ? Math.round((y / max) * 10000) / 100 : 0
    if (Math.abs(nextPercent - percent) >= 0.75) percent = nextPercent
  }

  function onScroll() {
    if (!browser) return
    const y = window.scrollY
    if (scrollRaf) return
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0
      applyScroll(y)
    })
  }

  onMount(() => {
    if (!browser) return
    applyScroll(window.scrollY)
  })
</script>

<svelte:head>
  <meta name="theme-color" content={currentThemeColor} />
</svelte:head>

<svelte:window onscroll={onScroll} />

<header
  id="header"
  class:-translate-y-32={!pin && scrollY > 0}
  class="fixed z-50 w-screen transition-transform duration-300 ease-out border-b-2 border-transparent max-h-[4.125rem] site-header {scrollY >
    32 && 'site-header--scrolled'}">
  {#if !search}
    <div in:fly={{ x: -50, duration: 300, delay: 300 }} out:fly={{ x: -50, duration: 300 }} class="navbar">
      <div class="navbar-start">
        {#if headerConfig.nav}
          <Nav {path} {title} {pin} {scrollY} nav={headerConfig.nav} />
        {/if}
        <a href="/" class="btn btn-ghost normal-case text-lg">{site.title}</a>
      </div>
      <div class="navbar-end">
        {#if headerConfig.search}
          <button 
            aria-label="search" 
            onclick={() => searchModal?.open()} 
            tabindex="0" 
            class="btn btn-square btn-ghost group relative">
            <span class="i-heroicons-outline-search"></span>
            <span class="absolute -bottom-1 text-[10px] opacity-0 group-hover:opacity-60 transition-opacity">⌘K</span>
          </button>
        {/if}
        <div id="change-theme" class="dropdown dropdown-end">
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <!-- reference: https://github.com/saadeghi/daisyui/issues/1285 -->
          <div tabindex="0" class="btn btn-square btn-ghost">
            <span class="i-heroicons-outline-color-swatch"></span>
          </div>
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <!-- reference: https://github.com/saadeghi/daisyui/issues/1285 -->
          <div
            tabindex="0"
            class="shadow-2xl dropdown-content bg-base-100 text-base-content rounded-box w-64"
            class:hidden={!pin}>
            <ColorSelector themes={theme} onchange={(t: string) => (currentTheme = t)} />
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div in:fly={{ x: 50, duration: 300, delay: 300 }} out:fly={{ x: 50, duration: 300 }} class="navbar">
      <Search />
      <button aria-label="Close search" onclick={() => (search = !search)} tabindex="0" class="btn btn-square btn-ghost">
        <span class="i-heroicons-outline-x"></span>
      </button>
    </div>
  {/if}
</header>

<button
  id="totop"
  onclick={() => window.scrollTo(0, 0)}
  class:translate-y-24={scrollY === 0}
  aria-label="scroll to top"
  class="fixed grid group btn btn-circle btn-lg border-none bottom-6 right-6 z-50 transition-transform duration-300 ease-out totop-btn {percent >
  95
    ? 'btn-accent shadow-lg'
    : 'btn-ghost'}"
  class:opacity-100={scrollY}>
  <div
    class="radial-progress text-accent group-hover:text-accent-focus col-start-1 row-start-1"
    style={`--size:4rem; --thickness: 0.25rem; --value:${percent};`}></div>
  <div
    class:border-transparent={percent > 95}
    class="border-4 border-base-content/10 group-hover:border-transparent col-start-1 row-start-1 rounded-full w-full h-full p-4 grid">
    <span class="i-heroicons-solid-chevron-up !w-6 !h-6"></span>
  </div>
</button>

<style>
  :global(.site-header) {
    border-color: transparent;
    background-color: hsl(var(--b1));
  }

  :global(.site-header--scrolled) {
    border-color: color-mix(in srgb, hsl(var(--bc)) 10%, transparent);
    background-color: color-mix(in srgb, hsl(var(--b1)) 92%, transparent);
  }

  @supports (backdrop-filter: blur(8px)) {
    @media (prefers-reduced-motion: no-preference) {
      :global(.site-header--scrolled) {
        backdrop-filter: blur(10px);
        background-color: color-mix(in srgb, hsl(var(--b1)) 75%, transparent);
      }
    }
  }

  :global(.totop-btn:not(.btn-accent)) {
    background-color: color-mix(in srgb, hsl(var(--b1)) 88%, transparent);
  }

  @supports (backdrop-filter: blur(8px)) {
    @media (prefers-reduced-motion: no-preference) {
      :global(.totop-btn:not(.btn-accent)) {
        backdrop-filter: blur(8px);
        background-color: color-mix(in srgb, hsl(var(--b1)) 70%, transparent);
      }
    }
  }
</style>
