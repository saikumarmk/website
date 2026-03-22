<script lang="ts">
  let { pokemonName, size = 'pokemon-sprite', inline = false } = $props()

  let wrapperClass = $derived(`sprite-wrapper ${size}${inline ? ' inline-block align-middle ml-2' : ''}`)
  let spriteClass = $derived(`pokesprite pokemon ${pokemonName}`)
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