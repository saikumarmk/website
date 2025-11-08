<script lang="ts">
  import { onMount } from 'svelte'
  import { browser } from '$app/environment'
  
  let copiedCode: string | null = null
  
  function addCopyButtons() {
    if (!browser) return
    
    // Find all code blocks
    const codeBlocks = document.querySelectorAll('pre:not(.no-copy)')
    
    codeBlocks.forEach((pre) => {
      // Skip if button already exists
      if (pre.querySelector('.code-copy-btn')) return
      
      // Create wrapper if it doesn't exist
      if (!pre.parentElement?.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div')
        wrapper.className = 'code-block-wrapper relative'
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)
      }
      
      // Create copy button
      const button = document.createElement('button')
      button.className = 'code-copy-btn btn btn-xs btn-ghost absolute top-2 right-2 opacity-0 transition-opacity z-10'
      button.innerHTML = '<span class="i-heroicons-outline-clipboard w-4 h-4"></span>'
      button.setAttribute('aria-label', 'Copy code')
      button.setAttribute('title', 'Copy code')
      
      // Add click handler
      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent || pre.textContent || ''
        
        try {
          await navigator.clipboard.writeText(code)
          copiedCode = code
          button.innerHTML = '<span class="i-heroicons-outline-check w-4 h-4 text-success"></span>'
          
          setTimeout(() => {
            button.innerHTML = '<span class="i-heroicons-outline-clipboard w-4 h-4"></span>'
            copiedCode = null
          }, 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
          button.innerHTML = '<span class="i-heroicons-outline-x w-4 h-4 text-error"></span>'
          
          setTimeout(() => {
            button.innerHTML = '<span class="i-heroicons-outline-clipboard w-4 h-4"></span>'
          }, 2000)
        }
      })
      
      pre.parentElement?.appendChild(button)
      
      // Show button on hover
      const wrapper = pre.parentElement
      if (wrapper) {
        wrapper.addEventListener('mouseenter', () => {
          button.classList.remove('opacity-0')
          button.classList.add('opacity-100')
        })
        wrapper.addEventListener('mouseleave', () => {
          button.classList.remove('opacity-100')
          button.classList.add('opacity-0')
        })
      }
    })
  }
  
  onMount(() => {
    addCopyButtons()
    
    // Re-run when content changes (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      // Only re-add if new code blocks are added, not when buttons are added
      const hasNewCodeBlocks = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof HTMLElement && (
            node.tagName === 'PRE' || 
            node.querySelector?.('pre')
          )
        )
      )
      if (hasNewCodeBlocks) {
        addCopyButtons()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => observer.disconnect()
  })
</script>

<style>
  :global(.code-block-wrapper) {
    position: relative;
  }
  
  :global(.code-copy-btn:hover) {
    background-color: oklch(var(--b3) / 0.8);
  }
</style>

