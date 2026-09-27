<script lang="ts">
  import { get } from 'svelte/store'
  import { page } from '$app/stores'
  import Head from '$lib/components/head.svelte'

  /** When the root layout fails, `$page` / `get(page)` is not available — avoid a second crash. */
  function readPage() {
    try {
      return get(page)
    } catch {
      return null
    }
  }

  const p = readPage()
  const status = p?.status ?? 500
  const errMsg = p?.error?.message ?? 'Not found'
  const path = p?.url?.pathname ?? '/'
</script>

<Head page={{ title: String(status), path }} />

<div class="col error-page">
  <div class="smallcaps">Error {status}</div>
  <h1>{status === 404 ? 'This page was never sewn.' : errMsg}</h1>
  {#if status === 404}<p class="dek">Nothing grows at <code>{path}</code>.</p>{/if}
  <p><a href="/">Back to the front page</a> · <a href="/archive">All writing</a></p>
</div>

<style>
  .error-page {
    padding-block: 5rem 3rem;
  }
  .error-page h1 {
    margin: 0.4rem 0 0.8rem;
  }
</style>
