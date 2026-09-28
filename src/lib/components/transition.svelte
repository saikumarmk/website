<script lang="ts">
  import { onMount } from 'svelte'
  import { onNavigate } from '$app/navigation'
  import { fade } from 'svelte/transition'
  import { browser } from '$app/environment'
  import { prefersReducedMotion } from '$lib/utils/motion'
  import { getRouteTransitionPolicy, shouldUseViewTransition, shouldAnimateFade } from '$lib/utils/transition-policy'

  let { path = '', children } = $props()

  let useVt = $state(false)
  let useFade = $state(false)
  let policy = $state<'auto' | 'vt' | 'fade' | 'none'>('auto')

  function syncPolicy() {
    if (!browser) return
    policy = getRouteTransitionPolicy()
    useVt = shouldUseViewTransition()
    useFade = shouldAnimateFade()
  }

  onMount(() => {
    syncPolicy()
  })

  onNavigate(navigation => {
    if (!browser) return
    syncPolicy()
    if (!useVt) return

    return new Promise<void>(resolve => {
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })
</script>

{#if useVt || policy === 'none' || prefersReducedMotion()}
  <div class="layout-transition">
    {@render children?.()}
  </div>
{:else if useFade}
  {#key path}
    <div class="layout-transition" in:fade={{ duration: 220 }}>
      {@render children?.()}
    </div>
  {/key}
{:else}
  <div class="layout-transition">
    {@render children?.()}
  </div>
{/if}
