<script>
  export let customFont = false // Whether to use the custom Pokémon font or not
</script>

<div class={`framed ${customFont ? 'font-pokemonGB' : ''}`}>
  <p><slot></slot></p>
</div>
