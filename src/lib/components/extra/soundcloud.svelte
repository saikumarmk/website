<script lang="ts">
  let {
    type = 'track',
    id,
    visual = true,
    color = '#ff5500',
    autoplay = false,
    width = '100%',
    height: heightProp
  } = $props()

  let height = $derived(heightProp ?? (visual ? '300' : type === 'track' ? '166' : '450'))

  let src = $derived(`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/${type}s/${id}?${new URLSearchParams({
    color: color.startsWith('#') ? encodeURIComponent(color) : color,
    visual: visual ? 'true' : 'false',
    auto_play: autoplay ? 'true' : 'false',
    hide_related: 'false',
    show_comments: 'true',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'true'
  }).toString()}`)
</script>

<iframe title="SoundCloud music player" class="mb-4" {width} {height} scrolling="no" frameborder="no" allow="autoplay" {src} />
