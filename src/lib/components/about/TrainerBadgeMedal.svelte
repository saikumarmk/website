<script lang="ts">
  let {
    kind,
    locked = false,
    compact = false
  }: {
    kind: 'monash' | 'mac' | 'playbook' | 'canva' | 'locked'
    locked?: boolean
    compact?: boolean
  } = $props()
</script>

<span
  class="medal"
  class:medal-compact={compact}
  class:medal-locked={locked || kind === 'locked'}
  class:medal-monash={kind === 'monash'}
  class:medal-mac={kind === 'mac'}
  class:medal-playbook={kind === 'playbook'}
  class:medal-canva={kind === 'canva'}
  aria-hidden="true"
>
  <span class="medal-rim"></span>
  <span class="medal-face"></span>
  <span class="medal-gloss"></span>
  <span class="medal-icon">
    {#if locked || kind === 'locked'}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.8" />
      </svg>
    {:else if kind === 'monash'}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 18V8l6-4 6 4v10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        <path d="M9 18v-5h6v5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        <path d="M12 8v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      </svg>
    {:else if kind === 'mac'}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 7h8M7 12h10M9 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M6 5.5h12v13H6z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
      </svg>
    {:else if kind === 'playbook'}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 5.5h10v13H7z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
        <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <path d="M7 5.5 5 6.5v12l2-1" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
    {:else if kind === 'canva'}
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7.25" stroke="currentColor" stroke-width="1.7" />
        <path
          d="M12 6.2v11.6M8.1 8.4c2.2-.8 5.6-.8 7.8 0M8.1 15.6c2.2.8 5.6.8 7.8 0"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    {/if}
  </span>
  <span class="medal-ribbon"></span>
</span>

<style>
  .medal {
    --medal-a: var(--site-accent);
    --medal-b: color-mix(in srgb, var(--site-accent) 52%, #000);
    --medal-rim: color-mix(in srgb, var(--site-accent) 72%, #fff);
    --medal-icon: rgba(255, 255, 255, 0.96);
    position: relative;
    display: grid;
    place-items: center;
    width: 54px;
    height: 62px;
    flex: none;
  }

  .medal-compact {
    width: 40px;
    height: 46px;
  }

  .medal-monash {
    --medal-a: #0a7ec2;
    --medal-b: #004f7f;
    --medal-rim: #ffd100;
  }

  .medal-mac {
    --medal-a: #1f9a63;
    --medal-b: #0b5a3c;
    --medal-rim: #9dffd0;
  }

  .medal-playbook {
    --medal-a: #d8892f;
    --medal-b: #8f4f12;
    --medal-rim: #ffe2b0;
  }

  .medal-canva {
    --medal-a: #8b3ce8;
    --medal-b: #4b148f;
    --medal-rim: #4de8f2;
  }

  .medal-locked {
    --medal-a: color-mix(in srgb, var(--site-panel-2) 80%, #000);
    --medal-b: color-mix(in srgb, var(--site-bg-tint) 90%, #000);
    --medal-rim: var(--site-line-strong);
    --medal-icon: var(--site-dim);
    opacity: 0.62;
  }

  .medal-rim,
  .medal-face,
  .medal-gloss,
  .medal-icon,
  .medal-ribbon {
    position: absolute;
    pointer-events: none;
  }

  .medal-rim {
    inset: 0;
    clip-path: polygon(50% 0%, 92% 14%, 92% 62%, 50% 100%, 8% 62%, 8% 14%);
    background: linear-gradient(160deg, var(--medal-rim), color-mix(in srgb, var(--medal-rim) 55%, #000));
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.34);
  }

  .medal-face {
    inset: 3px;
    clip-path: polygon(50% 2%, 89% 15%, 89% 60%, 50% 96%, 11% 60%, 11% 15%);
    background:
      radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.42), transparent 44%),
      radial-gradient(circle at 70% 78%, rgba(0, 0, 0, 0.28), transparent 48%),
      linear-gradient(155deg, var(--medal-a), var(--medal-b));
    box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.22), inset 0 -4px 8px rgba(0, 0, 0, 0.28);
  }

  .medal-gloss {
    inset: 7px 10px auto;
    height: 14px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.42), transparent);
    opacity: 0.75;
  }

  .medal-icon {
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--medal-icon);
    transform: translateY(-2px);
  }

  .medal-icon :global(svg) {
    width: 22px;
    height: 22px;
  }

  .medal-compact .medal-icon :global(svg) {
    width: 16px;
    height: 16px;
  }

  .medal-ribbon {
    left: 50%;
    bottom: -1px;
    width: 18px;
    height: 9px;
    transform: translateX(-50%);
    background: linear-gradient(180deg, var(--medal-rim), color-mix(in srgb, var(--medal-rim) 58%, #000));
    clip-path: polygon(0 0, 100% 0, 86% 100%, 14% 100%);
    opacity: 0.92;
  }
</style>
