<script lang="ts">
  export let tags: string[] = []
  export let placeholder = 'Add tag'
  export let onAdd: (tag: string) => void = () => {}
  export let onRemove: (tag: string) => void = () => {}
  
  let inputValue = ''
  
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      const value = inputValue.trim()
      
      if (value) {
        // Handle comma-separated values
        const newTags = value
          .split(',')
          .map(t => t.trim().toUpperCase())
          .filter(t => t && !tags.includes(t))
        
        newTags.forEach(tag => onAdd(tag))
        inputValue = ''
      }
    }
  }
</script>

<div class="space-y-2">
  <input
    type="text"
    bind:value={inputValue}
    on:keypress={handleKeyPress}
    {placeholder}
    class="input input-bordered input-sm w-full"
  />
  
  {#if tags.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each tags as tag}
        <div class="badge badge-primary gap-2">
          {tag}
          <button
            on:click={() => onRemove(tag)}
            class="hover:text-error"
            aria-label="Remove {tag}">
            ✕
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

