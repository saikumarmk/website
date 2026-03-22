<!-- Badge.svelte -->
<script lang="ts">
  import { getBadgeInfo } from '$lib/utils/badge'

  let { name, className = '' } = $props()

  let badge = $derived.by(() => {
    const { bgColor, textColor, displayName } = getBadgeInfo(name)
    return {
      classes: `px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor} ${className}`,
      displayText: displayName || name
    }
  })
</script>

<span class={badge.classes}>
  {badge.displayText}
</span>

<style>
  :global(*) {
    z-index: 2;
  }
</style>
