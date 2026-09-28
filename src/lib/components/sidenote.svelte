<!--
  A margin note: <Sidenote n={1}>…</Sidenote> inside a paragraph. Beside the text from 60rem up;
  below that the number is a button that opens the note under the line.
  In .svelte.md posts keep raw `<`, `>` and arrows out of the note (MDSvex).
-->
<script lang="ts">
  import type { Snippet } from 'svelte'

  let { n, children }: { n: number | string; children?: Snippet } = $props()
  let open = $state(false)
</script>

<button
  class="sn-ref"
  type="button"
  aria-expanded={open}
  aria-controls="sn-{n}"
  aria-label="Note {n}"
  onclick={() => (open = !open)}>
  {n}
</button>
<span class="sn" class:open id="sn-{n}" role="note">
  <span class="n">{n}</span>
  {@render children?.()}
</span>
