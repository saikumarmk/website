<script lang="ts" module>
  export const prerender = true
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let { toc } = $props()

  let intersecting = $state<string[]>([])
  let intersectingArticle = $state(true)
  let bordered = $state<string[]>([])

  let headingsObserver: IntersectionObserver | undefined
  let articleObserver: IntersectionObserver | undefined

  onMount(() => {
    if (window.screen.availWidth >= 1280) {
      headingsObserver = new IntersectionObserver(
        headings =>
          headings.forEach(heading => {
            if (heading.isIntersecting) {
              intersecting = [...intersecting, heading.target.id]
            } else {
              intersecting = intersecting.filter(h => h !== heading.target.id)
            }
          }),
        { rootMargin: '-64px 0px 0px 0px' }
      )
      articleObserver = new IntersectionObserver(article => (intersectingArticle = article[0].isIntersecting))
      Array.from(document.querySelectorAll('main h2, main h3, main h4, main h5, main h6')).forEach(element =>
        headingsObserver!.observe(element)
      )
      const mainEl = document.getElementsByTagName('main')[0]
      if (mainEl) articleObserver.observe(mainEl)
    }
  })

  onDestroy(() => {
    headingsObserver?.disconnect()
    articleObserver?.disconnect()
  })

  $effect(() => {
    if (!intersectingArticle) {
      bordered = []
    } else if (intersecting.length > 0) {
      bordered = [...intersecting]
    }
  })

  $effect(() => {
    for (const heading of toc) {
      const slug = heading.slug!
      const el = document.getElementById(`toc-link-${slug}`)
      if (!el) continue
      if (bordered.includes(slug)) el.classList.add('!border-accent')
      else el.classList.remove('!border-accent')
    }
  })
</script>

<aside class="sticky top-16 py-8">
  <nav
    id="post-toc"
    aria-label="TableOfContent"
    dir="rtl"
    class="max-h-[calc(100vh-12rem)] overflow-y-hidden hover:overflow-y-auto">
    <ul dir="ltr" id="toc-list-root">
      {#each toc as { depth, title, slug }}
        <li id={`toc-item-${slug}`} class="flex flex-col">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <span
            dir="ltr"
            onclick={() =>
              document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' })}
            id={`toc-link-${slug}`}
            class="cursor-pointer border-l-4 border-transparent transition-all hover:border-primary hover:bg-base-content hover:bg-opacity-10 active:bg-primary active:text-primary-content active:font-bold pr-4 {depth <=
            2
              ? 'py-3'
              : 'py-2'}"
            class:pl-4={depth <= 2}
            class:pl-8={depth === 3}
            class:pl-12={depth === 4}
            class:pl-16={depth === 5}
            class:pl-20={depth === 6}>
            {title}
          </span>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
