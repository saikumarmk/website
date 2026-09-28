<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet } = $props()
</script>

<aside class="patch">{@render children?.()}</aside>

<style>
  .patch {
    position: relative;
    background: var(--panel);
    border-radius: 10px;
    padding: 1.05rem 1.3rem;
    margin: 1.6rem 0;
    font-size: 0.94em;
    color: var(--fg2);
  }
  .patch::before {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1.5px dashed color-mix(in srgb, var(--g1) 70%, transparent);
    border-radius: 7px;
    pointer-events: none;
  }
  .patch::after {
    content: '';
    position: absolute;
    right: -5px;
    top: -5px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: var(--r3);
    box-shadow:
      0 0 0 2.5px var(--bg),
      -7px 5px 0 -2px var(--g1);
  }
  .patch > :global(:first-child) {
    margin-top: 0;
  }
  .patch > :global(:last-child) {
    margin-bottom: 0;
  }
  .patch :global(h3) {
    font-size: 1.05rem;
    font-weight: 500;
    margin: 0 0 0.35rem;
    color: var(--fg);
  }
</style>
