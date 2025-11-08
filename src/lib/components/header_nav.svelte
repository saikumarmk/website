<script lang="ts">
  import { backgroundMode } from '$lib/stores/background'
  
  export let nav: { text: string; link?: string; children?: { text: string; link: string }[] }[]
  export let path: string
  export let title: string
  export let scrollY: number
  export let pin: boolean
  
  const options = [
    { value: 'none', label: 'No Background' },
    { value: 'three', label: 'Astro Background' },
    { value: 'poke', label: 'Pokémon Background' }
  ]
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- reference: https://github.com/saadeghi/daisyui/issues/1285 -->
<div class="dropdown lg:hidden">
  <label for="navbar-dropdown" tabindex="0" class="btn btn-square btn-ghost">
    <span class="i-heroicons-outline-menu-alt-1" />
  </label>
  <ul
    id="navbar-dropdown"
    tabindex="0"
    class:hidden={!pin}
    class="menu menu-compact dropdown-content bg-base-100 text-base-content shadow-lg rounded-box min-w-max max-w-52 p-2
    ">
    {#each nav as { text, link, children }}
      {#if link && !children}
        <li>
          <a class:font-bold={link === path} href={link}>{text}</a>
        </li>
      {:else if children}
        <li tabindex="0">
          <span class:font-bold={children.some(({ link }) => link === path)} class="justify-between gap-1 max-w-[13rem]">
            {text}
            <span class="i-heroicons-solid-chevron-right mr-2" />
          </span>
          <ul class="bg-base-100 text-base-content shadow-lg p-2">
            {#each children as { text, link }}
              <li>
                <a class:font-bold={link === path} href={link}>{text}</a>
              </li>
            {/each}
          </ul>
        </li>
      {/if}
    {/each}
    <!-- Background selector in mobile menu -->
    <li class="md:hidden mt-2 pt-2 border-t border-base-content/10">
      <div class="form-control px-2">
        <label class="label py-1">
          <span class="label-text text-xs opacity-70">Background</span>
        </label>
        <select class="select select-bordered select-sm w-full" bind:value={$backgroundMode}>
          {#each options as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>
    </li>
  </ul>
</div>
<div class:swap-active={scrollY > 32 && title} class="swap order-last hidden lg:inline-grid">
  <button
    on:click={() => window.scrollTo(0, 0)}
    class:hidden={scrollY < 32 || !title}
    class="swap-on btn btn-ghost text-base font-normal normal-case transition-all duration-200">
    {JSON.stringify(title) === '{}' ? '' : title}
  </button>
  <ul class:hidden={scrollY > 64 && title} class="swap-off menu menu-horizontal p-0">
    {#each nav as { text, link, children }}
      {#if link && !children}
        <li>
          <a class="!rounded-btn" class:font-bold={link === path} href={link}>{text}</a>
        </li>
      {:else if children}
        <li>
          <span class:font-bold={children.some(({ link }) => link === path)} class="!rounded-btn gap-1">
            {text}
            <span class="i-heroicons-solid-chevron-down -mr-1" />
          </span>
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <ul tabindex="0" class="menu rounded-box bg-base-100 text-base-content shadow-lg p-2">
            {#each children as { text, link }}
              <li>
                <a class:font-bold={link === path} href={link}>{text}</a>
              </li>
            {/each}
          </ul>
        </li>
      {/if}
    {/each}
  </ul>
</div>
