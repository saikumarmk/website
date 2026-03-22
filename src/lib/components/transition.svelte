<script lang="ts">
  import { fly } from 'svelte/transition'

  let { path = '', children } = $props()
</script>

{#key path}
  <div
    class="layout-transition bg-base-100 md:bg-base-200 pt-16 md:pb-8 lg:pb-16"
    in:fly={{ y: 100, duration: 300, delay: 300 }}
    out:fly={{ y: -100, duration: 300 }}>
    {@render children?.()}
  </div>
{/key}
