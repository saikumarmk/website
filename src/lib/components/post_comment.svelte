<script lang="ts">
  import type { CommentConfig } from '$lib/types/post'
  import { toSnake } from '$lib/utils/case'
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  let { post, config } = $props()

  const comments = import.meta.glob<any>('/src/lib/components/comments/*.svelte', { eager: true, import: 'default' })
  let currentComment = $state<string | undefined>(toSnake(config.use[0]))

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

  let currentConfig = $derived(
    currentComment ? (config as Record<string, unknown>)[currentComment] : undefined
  )

  let CommentComponent = $derived(
    currentComment ? comments[`/src/lib/components/comments/${currentComment}.svelte`] : undefined
  )
</script>

{#if config?.use.length > 0}
  <div id="post-comment" class="card card-body">
    {#if config.use.length > 1}
      <div class="tabs w-full mb-8" class:tabs-boxed={config?.['style'] === 'boxed'}>
        {#each config.use as name}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            onclick={() => selectComment(name)}
            class="flex-1 tab transition-all"
            class:tab-bordered={config?.['style'] === 'bordered'}
            class:tab-lifted={config?.['style'] === 'lifted'}
            class:tab-active={currentComment === toSnake(name)}>
            {name}
          </span>
        {/each}
      </div>
    {/if}
    {#if currentComment && CommentComponent}
      {#key currentComment}
        {@const Tag = CommentComponent}
        <Tag {post} config={currentConfig} />
      {/key}
    {/if}
  </div>
{/if}
