<script lang="ts">
  let { id, selected = false, onclick }: { id: string; selected?: boolean; onclick: () => void } = $props()

  const designs: Record<string, { outline: string; accent: string }> = {
    Monash: {
      outline: 'M32 4L43 14L55 12L52 27L59 34L48 43L45 53L32 61L19 53L16 43L5 34L12 27L9 12L21 14Z',
      accent: 'var(--c1)'
    },
    MAC: { outline: 'M23 5H41L46 14L56 16L61 32L56 48L46 50L41 59H23L18 50L8 48L3 32L8 16L18 14Z', accent: 'var(--c2)' },
    Playbook: {
      outline: 'M32 9L43 4L55 10L53 22L61 32L53 42L55 54L43 60L32 55L21 60L9 54L11 42L3 32L11 22L9 10L21 4Z',
      accent: 'var(--c3)'
    },
    Canva: {
      outline: 'M32 3L39 15L52 9L49 23L61 32L49 41L52 55L39 49L32 61L25 49L12 55L15 41L3 32L15 23L12 9L25 15Z',
      accent: 'var(--r3)'
    }
  }
  const design = $derived(designs[id] ?? designs.Playbook)
  const names: Record<string, string> = {
    Monash: 'Monash · academic honours',
    MAC: 'MAC · coding community',
    Playbook: 'Playbook · graduate and intern guide',
    Canva: 'Canva · creative research'
  }
</script>

<button
  class="patch"
  class:selected
  style:--patch-accent={design.accent}
  type="button"
  aria-label={names[id] ?? id}
  title={names[id] ?? id}
  aria-pressed={selected}
  aria-controls="trainer-badge-story"
  {onclick}>
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <path class="cloth" d={design.outline} />
    <path class="seam" d={design.outline} transform="translate(32 32) scale(.84) translate(-32 -32)" />
    <g class="facets">
      {#if id === 'Monash'}
        <path class="light" d="M32 4L32 61L19 53L16 43L5 34L12 27L9 12L21 14Z" />
        <path
          class="metal"
          d="M13 20L24 25L22 32L10 29ZM51 20L40 25L42 32L54 29M14 37L23 35L25 43L19 47ZM50 37L41 35L39 43L45 47Z" />
        <path class="gem" d="M32 17L44 27L40 44L32 51L24 44L20 27Z" />
        <path class="light" d="M32 17L32 51L24 44L20 27Z" />
        <path class="etch" d="M23 28L32 23L41 28L32 33ZM26 32V37Q32 41 38 37V32" />
      {:else if id === 'MAC'}
        <path class="light" d="M23 5H41L46 14L32 32L18 50L8 48L3 32L8 16L18 14Z" />
        <path class="gem" d="M22 17L42 17L51 32L42 47H22L13 32Z" />
        <path class="light" d="M22 17H42L32 32L22 47L13 32Z" />
        <path class="etch" d="M25 25L19 32L25 39M39 25L45 32L39 39M35 24L29 40" />
        <path class="circuit" d="M17 11L21 17M47 11L43 17M6 32H13M51 32H58M17 53L21 47M47 53L43 47" />
      {:else if id === 'Playbook'}
        <path class="light" d="M32 9L32 55L21 60L9 54L11 42L3 32L11 22L9 10L21 4Z" />
        <path class="metal" d="M32 13L38 22L49 26L40 33L38 46L32 51L26 46L24 33L15 26L26 22Z" />
        <path class="gem" d="M16 21Q24 18 32 24Q40 18 48 21V43Q40 40 32 47Q24 40 16 43Z" />
        <path class="light" d="M16 21Q24 18 32 24V47Q24 40 16 43Z" />
        <path class="etch" d="M32 24V47M21 27L27 29M21 33L27 35M37 29L43 27M37 35L43 33" />
        <path class="circuit" d="M32 7V13M6 32H11M53 32H58M32 51V57" />
      {:else}
        <path class="light" d="M32 3L32 61L25 49L12 55L15 41L3 32L15 23L12 9L25 15Z" />
        <path class="metal" d="M32 10L38 25L54 32L38 39L32 54L26 39L10 32L26 25Z" />
        <path class="gem" d="M32 16L44 32L32 48L20 32Z" />
        <path class="light" d="M32 16V48L20 32Z" />
        <path class="etch" d="M32 16L32 48M20 32H44M32 24L38 32L32 40L26 32Z" />
        <circle class="knot" cx="18" cy="18" r="2" />
        <circle class="knot" cx="46" cy="46" r="2" />
      {/if}
    </g>
  </svg>
</button>

<style>
  .patch {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 44px;
    min-height: 44px;
    padding: 0.2rem;
    border: 0;
    border-radius: 8px;
    background: none;
    color: var(--muted);
    cursor: var(--pointer);
  }
  svg {
    display: block;
    width: min(100%, 64px);
    aspect-ratio: 1;
    overflow: visible;
  }
  .cloth {
    fill: color-mix(in srgb, var(--patch-accent) 12%, var(--bg));
    stroke: color-mix(in srgb, var(--patch-accent) 75%, var(--rule));
    stroke-width: 1.5;
    transition:
      fill 0.2s,
      stroke 0.2s;
  }
  .seam {
    fill: none;
    stroke: color-mix(in srgb, var(--patch-accent) 65%, transparent);
    stroke-width: 1.2;
    stroke-dasharray: 1.6 2.6;
    stroke-linecap: round;
  }
  .facets {
    stroke: var(--patch-accent);
    stroke-width: 1;
    stroke-linejoin: round;
  }
  .gem {
    fill: color-mix(in srgb, var(--patch-accent) 70%, var(--bg));
  }
  .metal {
    fill: color-mix(in srgb, var(--g2) 45%, var(--bg));
    stroke: var(--g2);
  }
  .light {
    fill: var(--bg);
    opacity: 0.3;
    stroke: none;
  }
  .etch {
    fill: none;
    stroke: var(--bg);
    stroke-width: 1.5;
    stroke-linecap: round;
  }
  .circuit {
    fill: none;
    stroke: var(--g2);
    stroke-width: 1.5;
  }
  .knot {
    fill: var(--g1);
    stroke: var(--g2);
  }
  .patch:is(:hover, :focus-visible),
  .patch.selected {
    color: var(--patch-accent);
  }
  .patch:is(:hover, :focus-visible) .cloth,
  .selected .cloth {
    fill: color-mix(in srgb, var(--patch-accent) 13%, var(--bg));
    stroke: var(--patch-accent);
  }
  .selected .cloth {
    stroke-width: 2;
  }
  .selected .seam {
    stroke: var(--patch-accent);
  }
  @media (prefers-reduced-motion: reduce) {
    .cloth {
      transition: none;
    }
  }
</style>
