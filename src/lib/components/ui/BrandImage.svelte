<script lang="ts">
  let {
    src,
    alt,
    class: className = '',
    fallbackText = ''
  }: {
    src: string
    alt: string
    class?: string
    fallbackText?: string
  } = $props()

  let failed = $state(false)
  let label = $derived(fallbackText || alt)
</script>

{#if failed}
  <span
    class="inline-flex items-center justify-center rounded bg-base-300 text-xs font-semibold uppercase tracking-wide px-2 py-1 {className}"
    title={alt}
  >
    {label.slice(0, 3)}
  </span>
{:else}
  <img
    {src}
    {alt}
    class={className}
    loading="lazy"
    decoding="async"
    onerror={() => (failed = true)}
  />
{/if}
