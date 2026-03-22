<script lang="ts">
  let { name, size } = $props()

  let wrapperClass = $derived(`sprite-wrapper ${size}`)
  let spriteClass = $derived(`pokesprite ${name.replace('.', ' ')}`)
</script>

<div class={wrapperClass}>
  <span class={spriteClass}></span>
</div>
