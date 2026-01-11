<script lang="ts">
  export let pokemonName: string
  export let size: string = 'pokemon-sprite'
  export let inline: boolean = false

  // Define the class string with the Pokémon name
  $: wrapperClass = `sprite-wrapper ${size}${inline ? ' inline-block align-middle ml-2' : ''}`
  const spriteClass = `pokesprite pokemon ${pokemonName}`
</script>

{#if inline}
<span class={wrapperClass}>
  <span class={spriteClass}></span>
</span>
{:else}
<div class={wrapperClass}>
  <span class={spriteClass}></span>
</div>
{/if}
