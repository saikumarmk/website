<script lang="ts">
  export let name: string
  export let size: string

  const wrapperClass = `sprite-wrapper ${size}`
  const spriteClass = `pokesprite ${name.replace('.', ' ')}`
</script>

<div class={wrapperClass}>
  <span class={spriteClass}></span>
</div>
