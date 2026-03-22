<script lang="ts">
  let {
    id,
    list = undefined,
    playlist = undefined,
    start = undefined,
    autoplay = false,
    disablekb = false,
    controls = true,
    fs = true,
    loop = false
  } = $props()

  let src = $derived(`https://www.youtube.com/embed/${id}?${new URLSearchParams({
    ...(list ? { listType: 'playlist', list: 'true' } : {}),
    ...(playlist ? { playlist } : {}),
    ...(start ? { start } : {}),
    autoplay: autoplay ? '1' : '0',
    disablekb: disablekb ? '1' : '0',
    controls: controls ? '1' : '0',
    fs: fs ? '1' : '0',
    loop: loop ? '1' : '0'
  }).toString()}`)
</script>

<div class="relative pb-[56.25%] mb-4">
  <iframe
    {src}
    class="absolute w-full h-full"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    loading="lazy"
    allowfullscreen />
</div>
