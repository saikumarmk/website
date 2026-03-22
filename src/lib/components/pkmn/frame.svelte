<script>
  let { customFont = false, children } = $props()
</script>

<div class={`framed ${customFont ? 'font-pokemonGB' : ''}`}>
  <p>{@render children?.()}</p>
</div>
