<script lang="ts">
  import { onMount } from 'svelte'
  import { processMarkdown } from './mdsvex_processor.js'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github-dark.min.css'
  import { parsePythonToSections, processDocstring } from './parse-python-sections'

  type RenderedSection = {
    docs: string
    code: string
    renderedDocs: string
  }

  let { sourceUrl = '', title = 'Annotated Code' } = $props()

  let sections = $state<RenderedSection[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)

  async function loadAndParseCode() {
    try {
      loading = true
      error = null

      const response = await fetch(sourceUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const pythonCode = await response.text()
      const parsedSections = parsePythonToSections(pythonCode)

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

      requestAnimationFrame(() => {
        document.querySelectorAll('.annotated-code .code-panel pre code').forEach(block => {
          if (block.textContent?.trim()) {
            hljs.highlightElement(block as HTMLElement)
          }
        })
      })
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
      loading = false
      console.error('Error loading annotated code:', err)
    }
  }

  onMount(() => {
    if (sourceUrl) {
      loadAndParseCode()
    }
  })
</script>

<div class="annotated-code not-prose">
  <h2 class="renderer-title">{title}</h2>

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
  .annotated-code {
    width: 100%;
    margin: 0 auto;
    padding: 1rem;
  }

  .renderer-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
    color: hsl(var(--bc));
  }

  .renderer-container {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid hsl(var(--bc) / 0.15);
  }

  .loading-state,
  .error-state {
    padding: 2rem;
    text-align: center;
    font-size: 1rem;
  }

  .error-state {
    color: hsl(var(--er));
  }

  .code-section {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    border-bottom: 1px solid hsl(var(--bc) / 0.15);
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
    min-width: 0;
    padding: 1.5rem;
    background-color: hsl(var(--b1));
    border-right: 1px solid hsl(var(--bc) / 0.15);
    color: hsl(var(--bc));
  }

  .code-panel {
    min-width: 0;
    padding: 1.5rem;
    background-color: hsl(var(--b2));
  }

  .code-panel pre {
    margin: 0;
    max-width: 100%;
    background-color: var(--code-reveal-bg, #272822);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-panel pre code {
    font-size: 0.875rem;
    line-height: 1.5;
    font-family: 'Fira Code', monospace;
    background-color: transparent;
    padding: 0;
    color: var(--code-reveal-fg, #dddddd);
    white-space: pre;
  }

  @media (max-width: 768px) {
    .docs-panel {
      border-right: none;
      border-bottom: 1px solid hsl(var(--bc) / 0.15);
    }

    .annotated-code {
      padding: 0.5rem;
    }
  }

  .docs-panel :global(h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: hsl(var(--bc));
  }

  .docs-panel :global(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid hsl(var(--bc) / 0.15);
    padding-bottom: 0.5rem;
    color: hsl(var(--bc));
  }

  .docs-panel :global(h3) {
    font-size: 1.25rem;
    font-weight: 500;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: hsl(var(--bc) / 0.9);
  }

  .docs-panel :global(p) {
    margin-bottom: 1rem;
    line-height: 1.625;
    color: hsl(var(--bc) / 0.9);
  }

  .docs-panel :global(code) {
    background-color: hsl(var(--b3));
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: 'Fira Code', monospace;
    color: hsl(var(--bc));
  }

  .docs-panel :global(pre) {
    background-color: hsl(var(--b3));
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
    color: hsl(var(--bc) / 0.9);
  }

  .docs-panel :global(a) {
    color: hsl(var(--p));
    text-decoration: underline;
  }

  .docs-panel :global(a:hover) {
    opacity: 0.85;
  }

  .docs-panel :global(blockquote) {
    border-left: 4px solid hsl(var(--bc) / 0.2);
    padding-left: 1rem;
    margin: 1rem 0;
    color: hsl(var(--bc) / 0.7);
    font-style: italic;
  }

  .docs-panel :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  .docs-panel :global(th),
  .docs-panel :global(td) {
    border: 1px solid hsl(var(--bc) / 0.15);
    padding: 0.5rem;
    text-align: left;
  }

  .docs-panel :global(th) {
    background-color: hsl(var(--b3));
    font-weight: 600;
  }
</style>
