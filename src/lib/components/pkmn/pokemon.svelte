<script lang="ts">
  export let pokemonName: string
  export let size: string

  // Define the class string with the Pokémon name
  const wrapperClass = `sprite-wrapper ${size}`
  const spriteClass = `pokesprite pokemon ${pokemonName}`
</script>

<div class={wrapperClass}>
  <span class={spriteClass}></span>
</div>
