<script lang="ts">
  /* @see {@link https://github.com/sveltejs/kit/issues/241#issuecomment-1363621896} */

  type Image = {
    src: string
    w: number
    h: number
  }

  const sources = import.meta.glob<Image[]>(['/static/**/*.{jpg,jpeg,png,webp,avif}', '!/static/assets'], {
    query: {
      format: 'avif',
      quality: '80',
      width: '736',
      source: ''
    },
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

  let source: Image[] | undefined = $derived(sources[`/static${src}`])
</script>

{#if source}
  <picture>
    <source srcset={source.map(({ src, w }) => `${src} ${w}w`).join(', ')} type="image/avif" />
    <img {src} {alt} class={className ?? 'rounded-lg my-2 max-w-full h-auto'} {loading} {decoding} style="max-width: 800px; margin-left: auto; margin-right: auto;" />
  </picture>
{:else}
  <img {src} {alt} class={className ?? 'rounded-lg my-2 max-w-full h-auto'} {loading} {decoding} style="max-width: 800px; margin-left: auto; margin-right: auto;" />
{/if}
