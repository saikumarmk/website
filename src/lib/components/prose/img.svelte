<script lang="ts">
  /* @see {@link https://github.com/sveltejs/kit/issues/241#issuecomment-1363621896} */

  /** srcset strings ("… 736w, … 1472w"), keyed by /static/… path */
  const sources = import.meta.glob<string>('/static/assets/**/*.{jpg,jpeg,png,webp}', {
    query: { format: 'avif', quality: '80', w: '736;1472', withoutEnlargement: '', as: 'srcset' },
    import: 'default',
    eager: true
  })

  let {
    class: className = undefined,
    src,
    alt = src,
    loading = 'lazy',
    decoding = 'async'
  }: {
    class?: string
    src: string
    alt?: string
    loading?: 'eager' | 'lazy'
    decoding?: 'async' | 'sync' | 'auto'
  } = $props()

  let srcset: string | undefined = $derived(sources[`/static${src}`])
</script>

{#if srcset}
  <picture>
    <source {srcset} sizes="(min-width: 800px) 736px, 100vw" type="image/avif" />
    <img {src} {alt} class={className ?? 'rounded-lg my-2 max-w-full h-auto'} {loading} {decoding} style="max-width: 800px; margin-left: auto; margin-right: auto;" />
  </picture>
{:else}
  <img {src} {alt} class={className ?? 'rounded-lg my-2 max-w-full h-auto'} {loading} {decoding} style="max-width: 800px; margin-left: auto; margin-right: auto;" />
{/if}
