<script lang="ts">
  let {
    type = 'track',
    id,
    theme = true,
    compact = false,
    width = '100%',
    height: heightProp
  } = $props()

  let height = $derived(heightProp ?? (compact ? '152' : '352'))

  let src = $derived(`https://open.spotify.com/embed/${type}/${id}?${new URLSearchParams({
    utm_source: 'generator',
    theme: theme ? '1' : '0'
  }).toString()}`)
</script>

<iframe
  title="Spotify music player"
  class="mb-4 rounded-box"
  {src}
  {width}
  {height}
  frameborder="0"
  allowfullscreen
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy" />
