<!-- Badge.svelte -->
<script lang="ts">
  import { getBadgeInfo } from '$lib/utils/badge'

  export let name: string
  export let className: string = ''

  $: {
    const { bgColor, textColor, displayName } = getBadgeInfo(name)
    classes = `px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor} ${className}`
    displayText = displayName || name
  }

  let classes: string
  let displayText: string
</script>

<span class={classes}>
  {displayText}
</span>
