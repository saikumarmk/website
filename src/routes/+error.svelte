<script lang="ts">
  import { get } from 'svelte/store'
  import { page } from '$app/stores'
  import Head from '$lib/components/head.svelte'
  import Footer from '$lib/components/footer.svelte'

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

<div class="flex flex-col flex-nowrap justify-center xl:flex-row xl:flex-wrap min-h-[calc(100vh-4rem)]">
  <div class="flex flex-col flex-1 w-full max-w-screen-md mx-auto xl:mx-0 min-h-0">
    <article
      itemscope
      itemtype="https://schema.org/BlogPosting"
      class="card bg-base-100 rounded-none md:rounded-box shadow-xl md:mb-8 z-10 flex-1 flex flex-col">
      <main itemprop="articleBody" class="card-body prose urara-prose">
        <h1 class="opacity-20 text-6xl md:text-[12rem] -mt-2 mb-0">
          {status}
        </h1>
        <h2 class="-mt-12 md:-mt-24">{errMsg}</h2>
        <div class="card-actions">
          <a href="/" class="btn btn-neutral no-underline shadow-xl hover:shadow-2xl mt-8">
            <span class="i-heroicons-outline-home -ml-1 mr-2" />
            Back to Home
          </a>
        </div>
      </main>
    </article>
    <Footer />
  </div>
</div>
