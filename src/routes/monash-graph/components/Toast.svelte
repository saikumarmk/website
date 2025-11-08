<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  
  export let message: string
  export let type: 'success' | 'error' | 'info' = 'info'
  export let duration = 3000
  export let onClose: () => void = () => {}
  
  onMount(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  })
</script>

<div 
  class="toast toast-top toast-end z-50"
  in:fly={{ y: -20, duration: 300 }}
  out:fade={{ duration: 200 }}>
  <div class="alert" class:alert-success={type === 'success'} class:alert-error={type === 'error'} class:alert-info={type === 'info'}>
    <span>{message}</span>
  </div>
</div>

