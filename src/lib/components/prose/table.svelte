<script lang="ts">
  let { children } = $props()
</script>

<div class="prose-table-wrap overflow-x-auto mb-4">
  <table class="table">
    {@render children?.()}
  </table>
</div>

<style>
  .prose-table-wrap {
    max-width: 100%;
    min-width: 0;
  }

  .prose-table-wrap table {
    min-width: 100%;
    width: max-content;
    max-width: none;
  }
</style>
