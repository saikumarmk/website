<script lang="ts">
  let { children } = $props()
</script>

<div class="overflow-x-auto mb-4">
  <table class="table w-full">
    {@render children?.()}
  </table>
</div>
