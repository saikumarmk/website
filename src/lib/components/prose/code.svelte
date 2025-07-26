<script>
  import { onMount } from 'svelte'
  import { processMarkdown } from './mdsvex_processor.js'
  import hljs from 'highlight.js'

  export let sourceUrl = ''
  export let title = 'Python Code Renderer'

  let sections = []
  let loading = true
  let error = null

  function parseCodeToSections(code) {
    const lines = code.split('\n')
    const sections = []
    let docsBuffer = []
    let codeBuffer = []

    const flushSection = () => {
      if (docsBuffer.length > 0 || codeBuffer.length > 0) {
        sections.push({
          docs: docsBuffer.join('\n'),
          code: codeBuffer.join('\n')
        })
      }
      docsBuffer = []
      codeBuffer = []
    }

    let inDocstring = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      if (inDocstring) {
        docsBuffer.push(line)
        if (trimmed.endsWith('"""') || trimmed.endsWith("'''")) {
          inDocstring = false
        }
      } else if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        if (codeBuffer.length > 0 && !/^\s*(class|def)/.test(codeBuffer[codeBuffer.length - 1].trim())) {
          flushSection()
        }
        docsBuffer.push(line)
        if (!(trimmed.length > 3 && trimmed.endsWith(trimmed.substring(0, 3)))) {
          inDocstring = true
        }
      } else if (trimmed.startsWith('#')) {
        flushSection()
        while (i < lines.length && (lines[i].trim().startsWith('#') || lines[i].trim() === '')) {
          docsBuffer.push(lines[i])
          i++
        }
        i--
      } else {
        if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
          flushSection()
        }
        codeBuffer.push(line)
      }
    }

    flushSection()
    return sections
  }

  function processDocstring(docContent) {
    const trimmed = docContent.trim()

    if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
      const content = trimmed.slice(3, -3)
      const lines = content.split('\n')
      const firstLine = lines.find(line => line.trim() !== '') || ''
      const indentation = firstLine ? firstLine.match(/^\s*/)[0].length : 0
      return lines.map(line => line.substring(indentation)).join('\n')
    }

    if (trimmed.startsWith('#')) {
      return docContent
        .split('\n')
        .map(line => line.trim().replace(/^#\s?/, ''))
        .join('\n')
    }

    return docContent
  }

  async function loadAndParseCode() {
    try {
      loading = true
      error = null

      const response = await fetch(sourceUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const pythonCode = await response.text()
      const parsedSections = parseCodeToSections(pythonCode)

      sections = await Promise.all(
        parsedSections.map(async section => {
          const processedDocs = processDocstring(section.docs)
          const renderedDocs = await processMarkdown(processedDocs)

          return {
            docs: processedDocs,
            code: section.code,
            renderedDocs
          }
        })
      )

      loading = false

      // Highlight code blocks after DOM update
      setTimeout(() => {
        document.querySelectorAll('.python-code-renderer .code-panel pre code').forEach(block => {
          if (block.textContent?.trim()) {
            hljs.highlightElement(block)
          }
        })
      }, 100)
    } catch (err) {
      error = err.message
      loading = false
      console.error('Error loading code:', err)
    }
  }

  onMount(() => {
    if (sourceUrl) {
      loadAndParseCode()
    }
  })
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
</svelte:head>

<div class="python-code-renderer">
  <h1 class="renderer-title">{title}</h1>

  <div class="renderer-container">
    {#if loading}
      <div class="loading-state">Loading content...</div>
    {:else if error}
      <div class="error-state">Error: {error}</div>
    {:else}
      {#each sections as section}
        {#if section.docs.trim() || section.code.trim()}
          <div class="code-section">
            <div class="docs-panel">
              {@html section.renderedDocs}
            </div>
            <div class="code-panel">
              <pre><code class="language-python">{section.code}</code></pre>
            </div>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style>
  .python-code-renderer {
    width: 100%;
    margin: 0 auto;
    padding: 1rem;
  }

  .renderer-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .renderer-container {
    box-shadow:
      0 10px 15px -3px rgb(0 0 0 / 0.1),
      0 4px 6px -4px rgb(0 0 0 / 0.1);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .loading-state,
  .error-state {
    padding: 2rem;
    text-align: center;
    font-size: 1rem;
  }

  .error-state {
    color: #ef4444;
    border-radius: 0.5rem;
    margin: 1rem;
  }

  .code-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid #e5e7eb;
    min-height: 100px;
  }

  .code-section:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    .code-section {
      grid-template-columns: 1fr;
    }
  }

  .docs-panel {
    padding: 1.5rem;
    background-color: white;
    border-right: 1px solid #e5e7eb;
    color: #374151;
  }

  .code-panel {
    padding: 1.5rem;
    background-color: #f9fafb;
  }

  .code-panel pre {
    margin: 0;
    background-color: #1f2937;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-panel pre code {
    font-size: 0.875rem;
    line-height: 1.5;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    background-color: transparent;
    padding: 0;
    color: #f9fafb;
    white-space: pre;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .docs-panel {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }

    .python-code-renderer {
      padding: 0.5rem;
    }
  }

  /* Documentation content styling */
  .docs-panel :global(h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #1f2937;
  }

  .docs-panel :global(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    color: #374151;
  }

  .docs-panel :global(h3) {
    font-size: 1.25rem;
    font-weight: 500;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #4b5563;
  }

  .docs-panel :global(p) {
    margin-bottom: 1rem;
    line-height: 1.625;
    color: #374151;
  }

  .docs-panel :global(code) {
    background-color: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    color: #1f2937;
  }

  .docs-panel :global(pre) {
    background-color: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .docs-panel :global(pre code) {
    background-color: transparent;
    padding: 0;
  }

  .docs-panel :global(ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .docs-panel :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .docs-panel :global(li) {
    margin-bottom: 0.5rem;
    color: #374151;
  }

  .docs-panel :global(a) {
    color: #2563eb;
    text-decoration: underline;
  }

  .docs-panel :global(a:hover) {
    color: #1d4ed8;
  }

  .docs-panel :global(blockquote) {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #6b7280;
    font-style: italic;
  }

  .docs-panel :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .docs-panel :global(th),
  .docs-panel :global(td) {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }

  .docs-panel :global(th) {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  .docs-panel :global(td) {
    color: #374151;
  }
</style>
