<script lang="ts">
  import { onMount } from 'svelte'
  import { afterNavigate } from '$app/navigation'

  function languageOf(pre: HTMLElement) {
    const id = pre.querySelector('.language-id')?.textContent?.trim()
    if (id) return id
    const cls = [...pre.classList, ...(pre.querySelector('code')?.classList ?? [])].find(c => c.startsWith('language-'))
    return cls?.slice('language-'.length) || pre.dataset.lang || 'code'
  }

  function codeText(pre: HTMLElement) {
    const clone = pre.cloneNode(true) as HTMLElement
    clone.querySelectorAll('.language-id, .code-tab, .twoslash-popup-container, data-lsp').forEach(el => {
      if (el.tagName === 'DATA-LSP') el.replaceWith(...el.childNodes)
      else el.remove()
    })
    return (clone.querySelector('code') ?? clone).textContent ?? ''
  }

  function wrap(pre: HTMLElement) {
    if (pre.parentElement?.classList.contains('codewrap')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'codewrap'
    pre.before(wrapper)
    wrapper.append(pre)

    const tab = document.createElement('div')
    tab.className = 'code-tab'
    const lang = document.createElement('span')
    lang.textContent = languageOf(pre)
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'copy'
    button.setAttribute('aria-label', `Copy ${lang.textContent} code`)
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeText(pre))
        button.textContent = 'copied'
      } catch {
        button.textContent = 'failed'
      }
      setTimeout(() => (button.textContent = 'copy'), 1600)
    })
    tab.append(lang, button)
    wrapper.prepend(tab)
  }

  function addCopyButtons() {
    document.querySelectorAll<HTMLElement>('.post-prose pre:not(.no-copy)').forEach(wrap)
  }

  onMount(() => {
    addCopyButtons()
    afterNavigate(() => requestAnimationFrame(addCopyButtons))
  })
</script>
