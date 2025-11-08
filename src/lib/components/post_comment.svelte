<script lang="ts">
  import type { CommentConfig } from '$lib/types/post'
  import { toSnake } from '$lib/utils/case'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'
  
  export let post: Urara.Post
  export let config: CommentConfig
  
  const comments = import.meta.glob<any>('/src/lib/components/comments/*.svelte', { eager: true, import: 'default' })
  let currentComment: string | undefined = toSnake(config.use[0])
  let currentConfig: unknown | undefined = undefined
  
  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem('comment')
      if (saved) {
        currentComment = saved
      }
    }
  })
  
  function selectComment(name: string) {
    currentComment = toSnake(name)
    if (browser) {
      localStorage.setItem('comment', toSnake(name))
    }
  }
  
  // @ts-ignore No index signature with a parameter of type 'string' was found on type 'CommentConfig'. ts(7053)
  $: if (currentComment) currentConfig = config[currentComment]
</script>

{#if config?.use.length > 0}
  <div id="post-comment" class="card card-body">
    {#if config.use.length > 1}
      <div class="tabs w-full mb-8" class:tabs-boxed={config?.['style'] === 'boxed'}>
        {#each config.use as name}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            on:click={() => selectComment(name)}
            class="flex-1 tab transition-all"
            class:tab-bordered={config?.['style'] === 'bordered'}
            class:tab-lifted={config?.['style'] === 'lifted'}
            class:tab-active={currentComment === toSnake(name)}>
            {name}
          </span>
        {/each}
      </div>
    {/if}
    {#if currentComment}
      {#key currentComment}
        <svelte:component
          this={comments[`/src/lib/components/comments/${currentComment}.svelte`]}
          {post}
          config={currentConfig} />
      {/key}
    {/if}
  </div>
{/if}
