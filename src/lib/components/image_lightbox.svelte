<script lang="ts">
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'
  import { browser } from '$app/environment'
  
  let isOpen = false
  let currentImage: string = ''
  let currentAlt: string = ''
  
  function openLightbox(src: string, alt: string) {
    currentImage = src
    currentAlt = alt
    isOpen = true
    if (browser) {
      document.body.style.overflow = 'hidden'
    }
  }
  
  function closeLightbox() {
    isOpen = false
    currentImage = ''
    currentAlt = ''
    if (browser) {
      document.body.style.overflow = ''
    }
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeLightbox()
    }
  }
  
  function attachClickHandlers() {
    if (!browser) return
    
    const images = document.querySelectorAll('.urara-prose img, .prose img')
    
    images.forEach((img) => {
      if (img.classList.contains('lightbox-enabled')) return
      
      img.classList.add('lightbox-enabled', 'cursor-zoom-in')
      img.addEventListener('click', () => {
        const src = (img as HTMLImageElement).src
        const alt = (img as HTMLImageElement).alt
        openLightbox(src, alt)
      })
    })
  }
  
  onMount(() => {
    attachClickHandlers()

    afterNavigate(() => {
      requestAnimationFrame(attachClickHandlers)
    })
  })
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-[100] overlay-dim overlay-dim--heavy flex items-center justify-center p-4 animate-in fade-in duration-200"
    onclick={closeLightbox}
    onkeydown={(e) => e.key === 'Enter' && closeLightbox()}
    role="button"
    tabindex="0"
    aria-label="Close lightbox">
    <button
      onclick={closeLightbox}
      class="absolute top-4 right-4 btn btn-circle btn-ghost text-white hover:bg-white/20 z-10"
      aria-label="Close lightbox">
      <span class="i-heroicons-outline-x w-6 h-6"></span>
    </button>
    
    <div
      class="relative max-w-7xl max-h-full flex items-center justify-center"
      onclick={e => e.stopPropagation()}
      onkeydown={e => e.stopPropagation()}
      role="button"
      tabindex="-1">
      <img
        src={currentImage}
        alt={currentAlt}
        class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        onclick={e => e.stopPropagation()} />
      
      {#if currentAlt}
        <div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-center rounded-b-lg">
          {currentAlt}
        </div>
      {/if}
    </div>
    
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm flex items-center gap-2">
      <kbd class="kbd kbd-sm">ESC</kbd>
      <span>or click outside to close</span>
    </div>
  </div>
{/if}

<style>
  :global(.lightbox-enabled) {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
  
  :global(.lightbox-enabled:hover) {
    transform: scale(1.02);
    opacity: 0.9;
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .fade-in {
    animation: fadeIn 0.2s ease;
  }
  
  .zoom-in-95 {
    animation: zoomIn 0.3s ease;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes zoomIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
