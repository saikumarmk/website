<script lang="ts">
  import type { GiscusConfig } from '$lib/types/post'
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  
  export let post: Urara.Post
  export let config: GiscusConfig
  
  let giscusContainer: HTMLDivElement
  
  onMount(() => {
    if (!browser) return
    
    // Create and configure the giscus script
    const script = document.createElement('script')
    script.src = config.src || 'https://giscus.app/client.js'
    script.setAttribute('data-repo', config.repo)
    script.setAttribute('data-repo-id', config.repoID)
    if (config.category) script.setAttribute('data-category', config.category)
    script.setAttribute('data-category-id', config.categoryID)
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', config.reactionsEnabled !== false ? '1' : '0')
    script.setAttribute('data-emit-metadata', config.emitMetadata ? '1' : '0')
    script.setAttribute('data-input-position', config.inputPosition || 'bottom')
    script.setAttribute('data-theme', config.theme || 'preferred_color_scheme')
    script.setAttribute('data-lang', config.lang || 'en')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    
    giscusContainer.appendChild(script)
  })
</script>

<div bind:this={giscusContainer} class="giscus" />

